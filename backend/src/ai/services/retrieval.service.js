import { getDocumentText } from '../../modules/documents/service.js';

/**
 * Retrieves document context for a given documentId and optional query message.
 * Abstracted retriever interface to easily support Vector DB chunk retrieval in future iterations.
 * 
 * @param {string} documentId - The unique MongoDB ObjectId for the document.
 * @param {string} [query] - Optional user query message for RAG similarity filtering.
 * @returns {Promise<string|Array<{text: string, metadata?: Object}>>} Document context string or chunk array.
 */
export const retrieveDocumentContext = async (documentId, query = '') => {
  if (!documentId) {
    return null;
  }

  try {
    // Current implementation: Fetches full extracted text from document storage.
    // Future Vector RAG implementation will perform chunk embedding & vector search:
    // const chunks = await vectorDb.similaritySearch(documentId, query, { topK: 5 });
    // return chunks;
    
    const text = await getDocumentText(documentId);
    return text;
  } catch (err) {
    const error = new Error(`Failed to retrieve document context for ID '${documentId}': ${err.message}`);
    error.status = err.status || 404;
    throw error;
  }
};
