import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || 'http://localhost:8000';

/**
 * Forward uploaded document file and metadata to FastAPI RAG service.
 * @param {string} filePath - Path to uploaded file on disk.
 * @param {string} originalName - Original filename.
 * @param {string} documentId - Unique MongoDB document ID.
 * @param {string} userId - User ObjectId or string.
 * @returns {Promise<Object>} FastAPI response data (chunk stats, embedding status).
 */
export const forwardDocumentToRagService = async (filePath, originalName, documentId, userId) => {
  if (!userId || !userId.toString().trim() || userId.toString().trim() === 'anonymous') {
    throw new Error('userId is mandatory for uploading and indexing documents to ensure multi-tenant user isolation.');
  }

  const cleanUserId = userId.toString().trim();
  const resolvedPath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);

  if (!fs.existsSync(resolvedPath)) {
    const err = `File not found on disk at path: ${resolvedPath}`;
    console.error(`[RAG ERROR] ${err}`);
    throw new Error(err);
  }

  console.log(`[RAG] Forwarding file '${originalName}' (docId: ${documentId}, user: ${cleanUserId}) to FastAPI at ${RAG_SERVICE_URL}/upload`);

  const formData = new FormData();
  formData.append('file', fs.createReadStream(resolvedPath), {
    filename: originalName,
    contentType: 'application/pdf',
  });
  formData.append('document_id', documentId ? documentId.toString() : '');
  formData.append('user_id', cleanUserId);

  try {
    const response = await axios.post(`${RAG_SERVICE_URL}/upload`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 60000,
    });

    const data = response.data;
    const storedCount = data.embedding?.stored_count ?? 0;
    const totalCount = data.embedding?.collection_total ?? 0;
    console.log(`[RAG] Indexing completed successfully for '${originalName}' (${storedCount} vectors stored, collection total: ${totalCount})`);

    return data;
  } catch (error) {
    const message = error.response?.data?.detail || error.message;
    console.error(`[RAG ERROR] Indexing failed for '${originalName}' (${error.response?.status || 'network'}):`, message);
    throw new Error(`RAG Service document processing failed: ${message}`);
  }
};

/**
 * Forward student question query to FastAPI RAG service.
 * @param {string} query - Student question.
 * @param {string} userId - User ObjectId or string.
 * @param {number} [topK=5] - Number of top chunks to retrieve.
 * @returns {Promise<Object>} RAG response object (answer, sources, query, user_id).
 */
export const queryRagService = async (query, userId, topK = 5, mode = null, similarityThreshold = null) => {
  if (!userId || !userId.toString().trim() || userId.toString().trim() === 'anonymous') {
    throw new Error('userId is mandatory for RAG query processing to ensure multi-tenant user isolation.');
  }

  const cleanUserId = userId.toString().trim();
  console.log(`[RAG] Querying RAG service for user '${cleanUserId}' (mode: ${mode || 'default'}, threshold: ${similarityThreshold || 'default'}): "${query.substring(0, 50)}..."`);
  try {
    const response = await axios.post(
      `${RAG_SERVICE_URL}/query`,
      {
        query: query.trim(),
        user_id: cleanUserId,
        top_k: topK,
        mode: mode || undefined,
        similarity_threshold: similarityThreshold !== null ? similarityThreshold : undefined,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 45000,
      }
    );

    const sourcesCount = response.data?.sources?.length || 0;
    console.log(`[RAG] Query response generated successfully (${sourcesCount} sources cited)`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.detail || error.message;
    console.error(`[RAG ERROR] Query failed for user '${cleanUserId}':`, message);
    throw new Error(`RAG Service query failed: ${message}`);
  }
};

/**
 * Fetch live runtime ChromaDB debug info from FastAPI service.
 */
export const getRagDebugInfoService = async () => {
  try {
    const response = await axios.get(`${RAG_SERVICE_URL}/debug/chroma`, { timeout: 15000 });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.detail || error.message;
    console.error('[RAG ERROR] Failed to fetch debug info from FastAPI:', message);
    return { status: 'error', error: message };
  }
};

/**
 * Fetch RAG management statistics from FastAPI service.
 */
export const getRagStatsService = async () => {
  try {
    const response = await axios.get(`${RAG_SERVICE_URL}/admin/stats`, { timeout: 15000 });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.detail || error.message;
    console.error('[RAG ERROR] Failed to fetch RAG stats from FastAPI:', message);
    return {
      status: 'offline',
      total_documents: 0,
      total_chunks: 0,
      embedding_model: 'BAAI/bge-small-en-v1.5',
      embedding_dimension: 384,
      chromadb_status: 'offline',
      queue_status: 'idle',
      failed_jobs: 0,
      last_indexing_time: null,
      indexed_documents: [],
      error: message,
    };
  }
};

/**
 * Trigger re-indexing for a specific document ID.
 */
export const reindexDocumentRagService = async (documentId) => {
  try {
    const response = await axios.post(`${RAG_SERVICE_URL}/admin/reindex/${documentId}`, {}, { timeout: 30000 });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.detail || error.message;
    console.error(`[RAG ERROR] Re-indexing failed for document '${documentId}':`, message);
    throw new Error(`Re-indexing document failed: ${message}`);
  }
};

/**
 * Delete vector embeddings for a document ID from ChromaDB.
 */
export const deleteDocumentVectorsRagService = async (documentId) => {
  try {
    const response = await axios.delete(`${RAG_SERVICE_URL}/admin/documents/${documentId}`, { timeout: 30000 });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.detail || error.message;
    console.error(`[RAG ERROR] Deleting vectors failed for document '${documentId}':`, message);
    throw new Error(`Deleting vectors failed: ${message}`);
  }
};

/**
 * Rebuild the vector store in ChromaDB.
 */
export const rebuildVectorStoreRagService = async () => {
  try {
    const response = await axios.post(`${RAG_SERVICE_URL}/admin/rebuild-index`, {}, { timeout: 45000 });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.detail || error.message;
    console.error('[RAG ERROR] Rebuilding vector store failed:', message);
    throw new Error(`Rebuilding vector store failed: ${message}`);
  }
};
