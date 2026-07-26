import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import {
  getConversations,
  createConversation,
  renameConversation,
  deleteConversation,
  getMessages,
  sendChatMessage,
} from '../services/chat.service';
import { uploadDocument } from '../services/document.service';

export function useChatSession() {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [renameModal, setRenameModal] = useState({ isOpen: false, convId: null, title: '' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, convId: null, title: '' });

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loadingAi]);

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadMessages = async (conversationId) => {
    setLoadingMessages(true);
    try {
      const res = await getMessages(conversationId);
      if (res?.success && res.messages) {
        setMessages(
          res.messages.map((m) => ({
            id: m._id,
            role: m.role,
            text: m.content,
            sources: m.sources || [],
            timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }))
        );
      }
    } catch (err) {
      toast.error('Failed to load conversation messages.');
    } finally {
      setLoadingMessages(false);
    }
  };

  const loadConversations = async () => {
    setLoadingConversations(true);
    try {
      const res = await getConversations();
      if (res?.success && res.conversations) {
        setConversations(res.conversations);
        if (res.conversations.length > 0) {
          const firstId = res.conversations[0]._id;
          setActiveConversationId(firstId);
          await loadMessages(firstId);
        }
      }
    } catch (err) {
      toast.error('Failed to load chat history from database.');
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const handleSelectConversation = async (convId) => {
    if (convId === activeConversationId) return;
    setActiveConversationId(convId);
    await loadMessages(convId);
  };

  const handleNewConversation = async () => {
    try {
      const res = await createConversation('New Chat');
      if (res?.success && res.conversation) {
        setConversations((prev) => [res.conversation, ...prev]);
        setActiveConversationId(res.conversation._id);
        setMessages([]);
        toast.success('Started new chat conversation');
      }
    } catch (err) {
      toast.error('Failed to create new conversation');
    }
  };

  const openRenameModal = (convId, currentTitle, e) => {
    if (e) e.stopPropagation();
    setRenameModal({ isOpen: true, convId, title: currentTitle });
  };

  const confirmRename = async () => {
    const { convId, title } = renameModal;
    if (!title || !title.trim()) {
      toast.error('Title cannot be empty');
      return;
    }
    try {
      const res = await renameConversation(convId, title.trim());
      if (res?.success && res.conversation) {
        toast.success('Conversation renamed');
        setConversations((prev) =>
          prev.map((c) => (c._id === convId ? { ...c, title: res.conversation.title } : c))
        );
        setRenameModal({ isOpen: false, convId: null, title: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to rename conversation');
    }
  };

  const openDeleteModal = (convId, currentTitle, e) => {
    if (e) e.stopPropagation();
    setDeleteModal({ isOpen: true, convId, title: currentTitle });
  };

  const confirmDelete = async () => {
    const { convId } = deleteModal;
    try {
      await deleteConversation(convId);
      toast.success('Conversation deleted');
      const updated = conversations.filter((c) => c._id !== convId);
      setConversations(updated);
      if (activeConversationId === convId) {
        if (updated.length > 0) {
          setActiveConversationId(updated[0]._id);
          await loadMessages(updated[0]._id);
        } else {
          setActiveConversationId(null);
          setMessages([]);
        }
      }
      setDeleteModal({ isOpen: false, convId: null, title: '' });
    } catch (err) {
      toast.error('Failed to delete conversation');
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loadingAi) return;

    const userText = input.trim();
    setInput('');
    setLoadingAi(true);
    const docId = attachedFiles.length > 0 ? attachedFiles[0].id : null;

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        text: userText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        attachments: [...attachedFiles],
      },
    ]);
    setAttachedFiles([]);

    try {
      const result = await sendChatMessage(activeConversationId, userText, docId);
      if (result && result.success) {
        if (!activeConversationId && result.conversationId) {
          setActiveConversationId(result.conversationId);
        }
        setMessages((prev) => [
          ...prev,
          {
            id: result.assistantMessage?._id,
            role: 'assistant',
            text: result.response,
            sources: result.sources || result.assistantMessage?.sources || [],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        const updatedConvs = await getConversations();
        if (updatedConvs?.success && updatedConvs.conversations) {
          setConversations(updatedConvs.conversations);
        }
      } else {
        throw new Error('API returned unsuccessful status');
      }
    } catch (err) {
      toast.error('Failed to get response', {
        description: err.response?.data?.message || err.message || 'Please check connection.',
      });
    } finally {
      setLoadingAi(false);
    }
  };

  const handleAttach = async (file) => {
    if (!file) return;
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      toast.error('Invalid file format', { description: 'Only PDF documents are supported.' });
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error('File limit exceeded', { description: 'Maximum permitted file size is 20 MB.' });
      return;
    }

    const toastId = toast.loading(`Uploading "${file.name}"... 0%`);
    try {
      const response = await uploadDocument(file, (progress) => {
        toast.loading(`Uploading "${file.name}"... ${progress}%`, { id: toastId });
      });
      if (response && response.success) {
        toast.success('Upload Complete', { id: toastId, description: `Successfully attached ${file.name}` });
        setAttachedFiles((prev) => [
          ...prev,
          { id: response.documentId, name: response.filename, size: `${(file.size / (1024 * 1024)).toFixed(1)} MB` },
        ]);
      } else {
        throw new Error('Upload returned unsuccessful status');
      }
    } catch (err) {
      toast.error('Upload Failed', {
        id: toastId,
        description: err.response?.data?.message || err.message || 'Check server connection.',
      });
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const activeConversation = conversations.find((c) => c._id === activeConversationId);

  return {
    conversations: filteredConversations,
    activeConversation,
    activeConversationId,
    messages,
    input,
    setInput,
    loadingMessages,
    loadingAi,
    loadingConversations,
    searchQuery,
    setSearchQuery,
    sidebarOpen,
    setSidebarOpen,
    attachedFiles,
    setAttachedFiles,
    renameModal,
    setRenameModal,
    deleteModal,
    setDeleteModal,
    messagesEndRef,
    handleSelectConversation,
    handleNewConversation,
    openRenameModal,
    confirmRename,
    openDeleteModal,
    confirmDelete,
    handleSend,
    handleAttach,
  };
}
