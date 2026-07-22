import asyncHandler from 'express-async-handler';
import { registerDocument } from './service.js';

/**
 * Handles PDF upload requests.
 * @route POST /api/documents/upload
 */
export const uploadDocumentController = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a valid PDF document');
  }

  // Delegate file metadata registration and parsing to service module
  const savedDocument = await registerDocument(req.file);

  res.status(201).json({
    success: true,
    documentId: savedDocument._id,
    filename: savedDocument.originalName,
    pages: savedDocument.pages,
    textLength: savedDocument.extractedText.length,
    uploadedAt: savedDocument.uploadedAt,
  });
});
