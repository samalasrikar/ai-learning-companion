import asyncHandler from 'express-async-handler';
import { registerDocument, getAllDocumentsService } from './service.js';
import { queryRagService } from '../../services/ragClient.service.js';

/**
 * Handles PDF upload requests.
 * Stores document metadata in MongoDB then forwards to FastAPI /upload endpoint.
 * Requires authenticated user session to enforce multi-tenant isolation.
 * @route POST /api/documents/upload
 */
export const uploadDocumentController = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a valid PDF document');
  }

  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error('Not authorized. Please log in to upload documents.');
  }

  const userId = req.user._id.toString();

  // Delegate file metadata registration and parsing to service module with strict userId
  const savedDocument = await registerDocument(req.file, userId);

  res.status(201).json({
    success: true,
    documentId: savedDocument._id,
    filename: savedDocument.originalName,
    pages: savedDocument.pages,
    textLength: savedDocument.extractedText ? savedDocument.extractedText.length : 0,
    uploadedBy: savedDocument.uploadedBy,
    uploadedAt: savedDocument.uploadedAt,
    rag: savedDocument.rag || null,
  });
});

/**
 * Fetch all uploaded documents.
 * @route GET /api/documents
 */
export const getDocumentsController = asyncHandler(async (req, res) => {
  const documents = await getAllDocumentsService();
  res.status(200).json({
    success: true,
    count: documents.length,
    documents,
  });
});

/**
 * Handles RAG query requests directly against uploaded documents.
 * Strictly derives userId from authenticated session to prevent cross-user document retrieval.
 * @route POST /api/documents/query
 */
export const queryDocumentController = asyncHandler(async (req, res) => {
  const { query, top_k } = req.body;
  if (!query || typeof query !== 'string' || !query.trim()) {
    res.status(400);
    throw new Error('Please provide a valid query string');
  }

  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error('Not authorized. Please log in to query documents.');
  }

  const userId = req.user._id.toString();
  const ragResult = await queryRagService(query.trim(), userId, top_k || 5);

  res.status(200).json({
    success: true,
    query: ragResult.query,
    userId: ragResult.user_id,
    answer: ragResult.answer,
    sources: ragResult.sources || [],
    mode: ragResult.mode || 'rag',
  });
});
