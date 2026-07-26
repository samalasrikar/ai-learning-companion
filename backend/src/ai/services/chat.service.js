import { queryRagService } from '../../services/ragClient.service.js';

/**
 * Handles student chat questions by forwarding requests via HTTP Axios to the FastAPI RAG service.
 * Eliminates duplication of RAG logic inside the Node.js backend.
 * 
 * @param {string} message - The user prompt/question message.
 * @param {string} [documentId] - Optional document context ID.
 * @param {Object} [options={}] - Additional options (userId, topK, mode, similarityThreshold, etc.).
 * @returns {Promise<Object>} Object containing answer text, cited sources, and mode.
 */
export const processChat = async (message, documentId = null, options = {}) => {
  if (!message || typeof message !== 'string' || !message.trim()) {
    const err = new Error('Message is required and must be a non-empty string.');
    err.status = 400;
    throw err;
  }

  const userId = options.userId || options.user?._id || 'anonymous';
  const topK = options.topK || 5;
  const mode = options.mode || null;
  const similarityThreshold = options.similarityThreshold !== undefined ? options.similarityThreshold : null;

  try {
    const ragResult = await queryRagService(message.trim(), userId, topK, mode, similarityThreshold);
    const sources = ragResult.sources || [];
    const resolvedMode = ragResult.mode || (sources.length > 0 ? 'rag' : 'general');

    return {
      answer: ragResult.answer || 'The information is not available in the uploaded documents.',
      sources,
      mode: resolvedMode,
      query: ragResult.query,
      user_id: ragResult.user_id,
    };
  } catch (err) {
    console.error('Error in processChat delegating to RAG service:', err.message);
    const error = new Error(`RAG query failed: ${err.message}`);
    error.status = err.status || 500;
    throw error;
  }
};
