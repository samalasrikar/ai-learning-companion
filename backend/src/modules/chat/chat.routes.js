import express from 'express';
import {
  createConversationHandler,
  getConversationsHandler,
  getConversationByIdHandler,
  updateConversationTitleHandler,
  deleteConversationHandler,
  getMessagesHandler,
  sendMessageHandler,
} from './chat.controller.js';
import { authenticateUser } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Require authentication for all chat & conversation endpoints
router.use(authenticateUser);

// Conversation endpoints
router.post('/chat/conversations', createConversationHandler);
router.get('/chat/conversations', getConversationsHandler);
router.get('/chat/conversations/:id', getConversationByIdHandler);
router.patch('/chat/conversations/:id', updateConversationTitleHandler);
router.delete('/chat/conversations/:id', deleteConversationHandler);

// Message endpoints
router.get('/chat/messages/:conversationId', getMessagesHandler);
router.post('/chat/messages', sendMessageHandler);

// Legacy backward-compatibility route
router.post('/chat', sendMessageHandler);

export default router;
