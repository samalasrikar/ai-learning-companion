import asyncHandler from 'express-async-handler';
import {
  createConversationService,
  getUserConversationsService,
  getConversationByIdService,
  deleteConversationService,
  updateConversationTitleService,
} from '../../services/conversation.service.js';
import {
  getMessagesByConversationService,
  saveMessageService,
} from '../../services/message.service.js';
import { processChat } from '../../ai/services/chat.service.js';
import Message from '../../models/message.model.js';

/**
 * Create a new conversation session.
 * @route POST /api/chat/conversations
 */
export const createConversationHandler = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const conversation = await createConversationService(req.user._id, title || 'New Chat');

  res.status(201).json({
    success: true,
    conversation,
  });
});

/**
 * Get all conversation threads for current user.
 * @route GET /api/chat/conversations
 */
export const getConversationsHandler = asyncHandler(async (req, res) => {
  const conversations = await getUserConversationsService(req.user._id);

  res.status(200).json({
    success: true,
    count: conversations.length,
    conversations,
  });
});

/**
 * Get conversation details by ID.
 * @route GET /api/chat/conversations/:id
 */
export const getConversationByIdHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const conversation = await getConversationByIdService(id, req.user._id);
  if (!conversation) {
    res.status(404);
    throw new Error('Conversation not found');
  }
  res.status(200).json({
    success: true,
    conversation,
  });
});

/**
 * Get transcript / messages for a specific conversation.
 * @route GET /api/chat/messages/:conversationId
 */
export const getMessagesHandler = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const messages = await getMessagesByConversationService(conversationId, req.user._id);

  res.status(200).json({
    success: true,
    count: messages.length,
    messages,
  });
});

export const getConversationMessagesHandler = getMessagesHandler;

/**
 * Delete a conversation thread.
 * @route DELETE /api/chat/conversations/:id
 */
export const deleteConversationHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await deleteConversationService(id, req.user._id);

  res.status(200).json({
    success: true,
    message: 'Conversation deleted successfully',
    result,
  });
});

/**
 * Rename a conversation thread.
 * @route PATCH /api/chat/conversations/:id
 */
export const updateConversationTitleHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  if (!title || !title.trim()) {
    res.status(400);
    throw new Error('Title is required');
  }

  const updatedConversation = await updateConversationTitleService(id, req.user._id, title.trim());

  res.status(200).json({
    success: true,
    conversation: updatedConversation,
  });
});

/**
 * Main chat message handler:
 * Accepts student question message, saves user message, invokes RAG service,
 * saves assistant response with sources and mode, and returns JSON.
 * @route POST /api/chat/message
 */
export const sendMessage = asyncHandler(async (req, res) => {
  const { message, conversationId: reqConvId, documentId } = req.body;

  if (!message || !message.trim()) {
    res.status(400);
    throw new Error('Message is required');
  }

  // 1. Get or create active conversation thread
  let conversationId = reqConvId;
  let conversation;

  if (conversationId) {
    conversation = await getConversationByIdService(conversationId, req.user._id);
  }

  if (!conversation) {
    conversation = await createConversationService(req.user._id, 'New Chat');
    conversationId = conversation._id;
  }

  // 2. Save user message to MongoDB
  const userMessage = await saveMessageService(conversationId, 'user', message.trim());

  // 3. Auto-generate conversation title from 1st message if title is 'New Chat'
  if (conversation.title === 'New Chat') {
    const messageCount = await Message.countDocuments({ conversationId });
    if (messageCount <= 1) {
      const generatedTitle = message.trim().slice(0, 40);
      conversation = await updateConversationTitleService(conversationId, req.user._id, generatedTitle);
    }
  }

  // 4. Execute AI RAG query via processChat
  const ragResult = await processChat(message.trim(), documentId, {
    userId: req.user._id,
    mode: 'hybrid',
    similarityThreshold: 0.75,
  });

  const responseText = typeof ragResult === 'string' ? ragResult : (ragResult.answer || '');
  const sources = typeof ragResult === 'object' ? (ragResult.sources || []) : [];
  const mode = typeof ragResult === 'object' ? (ragResult.mode || (sources.length > 0 ? 'rag' : 'general')) : 'rag';

  // 5. Save assistant response with cited document sources and mode to MongoDB
  const assistantMessage = await saveMessageService(conversationId, 'assistant', responseText, sources, mode);

  res.status(200).json({
    success: true,
    conversationId: conversation._id,
    conversationTitle: conversation.title,
    userMessage,
    assistantMessage,
    response: responseText,
    sources,
    mode,
  });
});

export const sendMessageHandler = sendMessage;
