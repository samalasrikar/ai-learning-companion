import api from './api';

/**
 * Sends a chat message to the Express backend.
 * @param {string} message - User prompt text.
 * @param {string} [documentId] - Optional uploaded document identifier context.
 * @returns {Promise<{success: boolean, response: string}>} The parsed API response.
 */
export const sendChatMessage = async (message, documentId) => {
  const payload = { message };
  if (documentId) {
    payload.documentId = documentId;
  }
  const response = await api.post('/chat', payload);
  return response.data;
};
