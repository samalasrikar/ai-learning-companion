import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Trash2, Plus, Bot, SidebarClose, SidebarOpen, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';
import SearchBar from '../components/common/SearchBar';
import { sendChatMessage } from '../services/chat.service';
import { uploadDocument } from '../services/document.service';

export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [attachedFiles, setAttachedFiles] = useState([]);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setLoading(true);

    // Extract documentId context if an attachment exists in queue
    const docId = attachedFiles.length > 0 ? attachedFiles[0].id : null;

    const userMsg = {
      role: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachments: [...attachedFiles],
    };
    setMessages((prev) => [...prev, userMsg]);
    const activeAttachments = [...attachedFiles];
    setAttachedFiles([]); // Clear queue for next message

    if (conversations.length === 0) {
      setConversations([
        {
          id: Date.now(),
          title: userText.length > 25 ? `${userText.slice(0, 25)}...` : userText,
          active: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }

    try {
      const result = await sendChatMessage(userText, docId);
      
      if (result && result.success) {
        const aiMsg = {
          role: 'assistant',
          text: result.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error('API returned unsuccessful status');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to get response', {
        description: err.message || 'Please check your backend connection.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAttach = async (file) => {
    if (!file) return;

    // 1. PDF File validation
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      toast.error('Invalid file format', {
        description: 'Only PDF documents are supported at this stage.',
      });
      return;
    }

    // 2. Max size validation (20 MB)
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File limit exceeded', {
        description: 'Maximum permitted file size is 20 MB.',
      });
      return;
    }

    // 3. Open loading toast loader
    const toastId = toast.loading(`Uploading "${file.name}"... 0%`);

    try {
      // 4. Trigger Axios service upload
      const response = await uploadDocument(file, (progress) => {
        toast.loading(`Uploading "${file.name}"... ${progress}%`, { id: toastId });
      });

      if (response && response.success) {
        toast.success('Upload Complete', {
          id: toastId,
          description: `Successfully attached ${file.name}`,
        });

        // 5. Store file metadata in local state
        const fileMeta = {
          id: response.documentId,
          name: response.filename,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        };
        setAttachedFiles((prev) => [...prev, fileMeta]);

        // 6. Push to shared list inside localStorage for Documents page
        const stored = localStorage.getItem('uploaded_documents');
        const docsList = stored ? JSON.parse(stored) : [];
        const newDocEntry = {
          id: response.documentId,
          name: response.filename,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          date: 'Uploaded via Chat',
        };
        localStorage.setItem('uploaded_documents', JSON.stringify([newDocEntry, ...docsList]));
      } else {
        throw new Error('Upload returned unsuccessful status');
      }
    } catch (err) {
      console.error(err);
      toast.error('Upload Failed', {
        id: toastId,
        description: err.response?.data?.message || err.message || 'Please check your connection to the server.',
      });
    }
  };

  const clearHistory = () => {
    setConversations([]);
    setMessages([]);
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="absolute inset-0 top-14 left-[240px] flex overflow-hidden bg-background">
      {/* Mobile/Tablet Backdrop drawer overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="absolute inset-0 bg-background/40 backdrop-blur-xs z-20 lg:hidden cursor-pointer"
        />
      )}

      {/* Left Pane: Conversation History Log List (Responsive Drawer) */}
      <aside 
        className={`border-r border-border/40 bg-muted/25 flex flex-col shrink-0 h-full transition-all duration-300 ease-in-out lg:relative absolute z-30 lg:z-0 left-0 top-0 bottom-0 bg-card ${
          sidebarOpen ? 'w-72 shadow-xl lg:shadow-none border-r' : 'w-0 overflow-hidden border-r-0'
        }`}
        aria-label="Conversation logs sidebar"
      >
        <div className="p-3 pb-2 flex flex-col gap-2 shrink-0">
          <Button
            onClick={() => setMessages([])}
            size="sm"
            className="w-full flex items-center justify-center gap-1.5 h-9 rounded-lg font-bold text-xs bg-primary text-primary-foreground shadow-sm transition-all hover:bg-primary/95"
            aria-label="Start new conversation"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Conversation</span>
          </Button>
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats..."
          />
        </div>

        {/* List of active sessions */}
        <div className="flex-grow overflow-y-auto px-3 pb-3 space-y-3 custom-scrollbar">
          {filteredConversations.length > 0 ? (
            <div className="space-y-1.5">
              <p className="px-2.5 text-[9px] font-bold text-muted-foreground uppercase tracking-widest text-left">
                Active Sessions
              </p>
              <div className="space-y-1">
                {filteredConversations.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-2 p-2.5 rounded-lg border bg-card border-border/40 hover:border-primary/20 text-muted-foreground hover:text-foreground cursor-pointer transition-all shadow-sm"
                  >
                    <MessageSquare className="h-4 w-4 shrink-0 text-primary" />
                    <div className="flex-grow min-w-0 flex items-center justify-between gap-2 text-left">
                      <span className="truncate text-xs font-bold text-foreground">{c.title}</span>
                      <span className="text-[9px] text-muted-foreground shrink-0 font-medium">
                        {c.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-[10px] text-muted-foreground px-4 leading-relaxed">
              No recent conversations. Start typing to create one.
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="p-3 border-t border-border/40 bg-muted/10 shrink-0">
          <Button
            variant="ghost"
            onClick={clearHistory}
            className="w-full flex items-center justify-start gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg px-2.5 h-9 transition-colors text-xs"
            aria-label="Clear chat messages"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear Current Chat</span>
          </Button>
        </div>
      </aside>

      {/* Right Pane: Conversation Area */}
      <section className="flex-grow flex flex-col bg-background relative h-full min-w-0" aria-label="Active chat workspace">
        {/* Workspace Subheader Bar */}
        <div className="h-10 border-b border-border/40 px-3 flex items-center justify-between bg-card/45 backdrop-blur-xs shrink-0 select-none">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(prev => !prev)}
            className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted"
            aria-label={sidebarOpen ? "Hide chat history" : "Show chat history"}
          >
            {sidebarOpen ? <SidebarClose className="h-4 w-4" /> : <SidebarOpen className="h-4 w-4" />}
          </Button>
          <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">
            AI Chat Workspace
          </span>
          <div className="w-7"></div>
        </div>

        {/* Messages Body */}
        <div className="flex-grow overflow-y-auto px-4 py-4 custom-scrollbar flex flex-col gap-4">
          <div className="max-w-4xl mx-auto w-full space-y-4 flex-grow">
            {messages.length > 0 ? (
              messages.map((msg, idx) => (
                <ChatMessage 
                  key={idx} 
                  message={msg} 
                  attachments={msg.attachments}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-28 space-y-3">
                <Bot className="h-10 w-10 text-primary/30 animate-pulse" />
                <h3 className="text-sm font-bold text-foreground">AI Chat Workspace</h3>
                <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                  Ask questions about your learning roadmap, explain complex concepts, or review study notes.
                </p>
              </div>
            )}

            {/* Loading Indicator */}
            {loading && (
              <div className="w-full py-1">
                <div className="max-w-4xl mx-auto flex gap-3.5 items-start justify-start">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5 shadow-sm text-primary-foreground animate-pulse">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col gap-1 max-w-[70%] items-start">
                    <div className="px-4 py-2.5 bg-card border border-border/40 text-foreground rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce"></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Bar Footer */}
        <footer className="p-4 border-t border-border/40 bg-card/60 backdrop-blur-md shrink-0">
          <div className="max-w-4xl mx-auto w-full space-y-2">
            {/* Attachment preview tags list */}
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pb-2">
                {attachedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-1 px-2.5 py-1 bg-muted border border-border/40 rounded-lg text-xs font-semibold text-foreground">
                    <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate max-w-[120px]">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => setAttachedFiles((prev) => prev.filter((_, i) => i !== idx))}
                      className="ml-1 text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10 rounded p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <ChatInput
              input={input}
              setInput={setInput}
              onSubmit={handleSend}
              onAttach={handleAttach}
              placeholder={loading ? 'Generating response...' : 'Ask AI Learning Companion...'}
            />
          </div>
        </footer>
      </section>
    </div>
  );
}
