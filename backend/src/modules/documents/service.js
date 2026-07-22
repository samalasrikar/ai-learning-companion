import fs from 'fs';
import Document from './document.model.js';
import { extractPdfData } from './pdf.service.js';

/**
 * Register document upload metadata and extract its text content to MongoDB.
 * @param {Object} file - The file object processed by multer.
 * @param {string} [userId] - Optional User ObjectId string of the uploader.
 * @returns {Promise<Object>} The saved MongoDB Document model.
 */
export const registerDocument = async (file, userId = null) => {
  if (!file) {
    throw new Error('No file metadata provided');
  }

  let extractedData = null;

  try {
    // 1. Extract text and page count from the PDF file
    extractedData = await extractPdfData(file.path);
  } catch (err) {
    // Clean up uploaded file on failure to prevent stale files on disk
    if (fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch (unlinkErr) {
        console.error('Failed to delete file on error cleanup:', unlinkErr);
      }
    }
    throw err;
  }

  // 2. Persist metadata and text content to MongoDB
  const newDocument = new Document({
    originalName: file.originalname,
    filename: file.filename,
    path: file.path,
    size: file.size,
    extractedText: extractedData.text,
    pages: extractedData.pages,
    uploadedBy: userId || null,
  });

  const savedDocument = await newDocument.save();
  return savedDocument;
};

/**
 * Fetch all documents with populated uploader details.
 */
export const getAllDocumentsService = async () => {
  const documents = await Document.find()
    .populate('uploadedBy', 'firstName lastName email avatar')
    .sort({ uploadedAt: -1 });
  return documents;
};

/**
 * Reads and returns extracted text of an uploaded document from MongoDB.
 * @param {string} documentId - The unique MongoDB ObjectId.
 * @returns {Promise<string>} The extracted text string.
 */
export const getDocumentText = async (documentId) => {
  const document = await Document.findById(documentId);
  
  if (!document) {
    throw new Error(`Document context not found for ID: ${documentId}`);
  }
  return document.extractedText;
};
