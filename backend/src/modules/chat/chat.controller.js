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
 * Get all conversations for the authenticated user.
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
 * Get single conversation by ID.
 * @route GET /api/chat/conversations/:id
 */
export const getConversationByIdHandler = asyncHandler(async (req, res) => {
  const conversation = await getConversationByIdService(req.params.id, req.user._id);

  res.status(200).json({
    success: true,
    conversation,
  });
});

/**
 * Update conversation title manually (Rename Chat).
 * @route PATCH /api/chat/conversations/:id
 */
export const updateConversationTitleHandler = asyncHandler(async (req, res) => {
  const { title } = req.body;
  if (!title || typeof title !== 'string' || !title.trim()) {
    res.status(400);
    throw new Error('Please provide a valid conversation title');
  }

  const conversation = await updateConversationTitleService(req.params.id, req.user._id, title.trim());

  res.status(200).json({
    success: true,
    message: 'Conversation renamed successfully',
    conversation,
  });
});

/**
 * Delete conversation and all its messages.
 * @route DELETE /api/chat/conversations/:id
 */
export const deleteConversationHandler = asyncHandler(async (req, res) => {
  await deleteConversationService(req.params.id, req.user._id);

  res.status(200).json({
    success: true,
    message: 'Conversation deleted successfully',
  });
});

/**
 * Get messages for a specific conversation.
 * @route GET /api/chat/messages/:conversationId
 */
export const getMessagesHandler = asyncHandler(async (req, res) => {
  const messages = await getMessagesByConversationService(req.params.conversationId, req.user._id);

  res.status(200).json({
    success: true,
    count: messages.length,
    messages,
  });
});

/**
 * Send user message, execute AI inference, auto-title on 1st prompt, and save assistant response.
 * @route POST /api/chat/messages
 */
export const sendMessageHandler = asyncHandler(async (req, res) => {
  let { conversationId, message, documentId } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    res.status(400);
    throw new Error('Please provide a valid message content');
  }

  // 1. If no conversationId provided or invalid, create new conversation for user
  let conversation = null;
  if (conversationId) {
    conversation = await getConversationByIdService(conversationId, req.user._id).catch(() => null);
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

  // 4. Execute AI processChat
  const responseText = await processChat(message.trim(), documentId);

  // 5. Save assistant response to MongoDB
  const assistantMessage = await saveMessageService(conversationId, 'assistant', responseText);

  res.status(200).json({
    success: true,
    conversationId: conversation._id,
    conversationTitle: conversation.title,
    userMessage,
    assistantMessage,
    response: responseText,
  });
});
