import asyncHandler from 'express-async-handler';
import { registerDocument, getAllDocumentsService } from './service.js';

/**
 * Handles PDF upload requests.
 * @route POST /api/documents/upload
 */
export const uploadDocumentController = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a valid PDF document');
  }

  // Delegate file metadata registration and parsing to service module, attaching uploader ID if logged in
  const savedDocument = await registerDocument(req.file, req.user?._id || null);

  res.status(201).json({
    success: true,
    documentId: savedDocument._id,
    filename: savedDocument.originalName,
    pages: savedDocument.pages,
    textLength: savedDocument.extractedText.length,
    uploadedBy: savedDocument.uploadedBy,
    uploadedAt: savedDocument.uploadedAt,
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
