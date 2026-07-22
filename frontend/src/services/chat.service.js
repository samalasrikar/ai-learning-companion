import api from './api';

/**
 * Fetch all conversations for the authenticated user from MongoDB.
 */
export const getConversations = async () => {
  const response = await api.get('/chat/conversations');
  return response.data;
};

/**
 * Create a new conversation in MongoDB.
 */
export const createConversation = async (title = 'New Chat') => {
  const response = await api.post('/chat/conversations', { title });
  return response.data;
};

/**
 * Rename an existing conversation in MongoDB.
 */
export const renameConversation = async (conversationId, title) => {
  const response = await api.patch(`/chat/conversations/${conversationId}`, { title });
  return response.data;
};

/**
 * Delete a conversation and all its messages from MongoDB.
 */
export const deleteConversation = async (conversationId) => {
  const response = await api.delete(`/chat/conversations/${conversationId}`);
  return response.data;
};

/**
 * Fetch messages for a specific conversation from MongoDB.
 */
export const getMessages = async (conversationId) => {
  const response = await api.get(`/chat/messages/${conversationId}`);
  return response.data;
};

/**
 * Sends a chat message to the Express backend & MongoDB.
 */
export const sendChatMessage = async (conversationId, message, documentId) => {
  const payload = { conversationId, message };
  if (documentId) {
    payload.documentId = documentId;
  }
  const response = await api.post('/chat/messages', payload);
  return response.data;
};
