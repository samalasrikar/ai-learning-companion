import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';

/**
 * Creates a new conversation for a user.
 */
export const createConversationService = async (userId, title = 'New Chat') => {
  const conversation = await Conversation.create({
    userId,
    title: title.slice(0, 40),
  });
  return conversation;
};

/**
 * Gets all conversations for a user, sorted newest first.
 */
export const getUserConversationsService = async (userId) => {
  const conversations = await Conversation.find({ userId }).sort({ updatedAt: -1 });
  return conversations;
};

/**
 * Gets a single conversation by ID for a user.
 */
export const getConversationByIdService = async (conversationId, userId) => {
  const conversation = await Conversation.findOne({ _id: conversationId, userId });
  if (!conversation) {
    const err = new Error('Conversation not found');
    err.status = 404;
    throw err;
  }
  return conversation;
};

/**
 * Deletes a conversation and all its associated messages.
 */
export const deleteConversationService = async (conversationId, userId) => {
  const conversation = await Conversation.findOneAndDelete({ _id: conversationId, userId });
  if (!conversation) {
    const err = new Error('Conversation not found or unauthorized');
    err.status = 404;
    throw err;
  }

  // Delete all associated messages
  await Message.deleteMany({ conversationId });
  return conversation;
};

/**
 * Updates conversation title.
 */
export const updateConversationTitleService = async (conversationId, userId, title) => {
  const conversation = await Conversation.findOneAndUpdate(
    { _id: conversationId, userId },
    { title: title.slice(0, 40) },
    { new: true }
  );
  return conversation;
};
