import fs from 'fs';
import Document from './document.model.js';
import { extractPdfData } from './pdf.service.js';

/**
 * Register document upload metadata and extract its text content to MongoDB.
 * @param {Object} file - The file object processed by multer.
 * @returns {Promise<Object>} The saved MongoDB Document model.
 */
export const registerDocument = async (file) => {
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
  });

  const savedDocument = await newDocument.save();
  return savedDocument;
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
