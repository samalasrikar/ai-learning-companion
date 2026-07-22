import Message from '../models/message.model.js';
import Conversation from '../models/conversation.model.js';

/**
 * Gets all messages for a specific conversation owned by the user.
 */
export const getMessagesByConversationService = async (conversationId, userId) => {
  // Ensure user owns the conversation
  const conversation = await Conversation.findOne({ _id: conversationId, userId });
  if (!conversation) {
    const err = new Error('Conversation not found or unauthorized');
    err.status = 404;
    throw err;
  }

  const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
  return messages;
};

/**
 * Saves a user or assistant message to MongoDB.
 */
export const saveMessageService = async (conversationId, role, content) => {
  const message = await Message.create({
    conversationId,
    role,
    content,
  });

  // Touch conversation updatedAt timestamp
  await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });

  return message;
};
