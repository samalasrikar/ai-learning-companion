import fs from 'fs';
import Document from './document.model.js';
import { extractPdfData } from './pdf.service.js';
import { forwardDocumentToRagService } from '../../services/ragClient.service.js';

/**
 * Register document upload metadata and extract its text content to MongoDB,
 * then forward the file and metadata to the FastAPI RAG service.
 * @param {Object} file - The file object processed by multer.
 * @param {string} [userId] - Optional User ObjectId string of the uploader.
 * @returns {Promise<Object>} The saved MongoDB Document model with attached RAG processing data.
 */
export const registerDocument = async (file, userId = null) => {
  if (!file) {
    throw new Error('No file metadata provided');
  }

  console.log(`[UPLOAD] Received ${file.originalname} (${file.size} bytes)`);

  let extractedData = null;

  try {
    // 1. Extract text and page count from the PDF file for local metadata
    extractedData = await extractPdfData(file.path);
    console.log(`[UPLOAD] Extracted ${extractedData.pages} pages (${extractedData.text.length} characters)`);
  } catch (err) {
    console.error(`[UPLOAD ERROR] PDF extraction failed for ${file.originalname}:`, err.message);
    if (fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch (unlinkErr) {
        console.error('[UPLOAD ERROR] Failed to delete file on error cleanup:', unlinkErr);
      }
    }
    throw err;
  }

  // 2. Store document metadata and extracted text in MongoDB
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
  console.log(`[UPLOAD] Saved metadata to MongoDB (id=${savedDocument._id})`);

  // 3. Forward the file and metadata to FastAPI RAG /upload endpoint
  let ragData = null;
  try {
    console.log(`[RAG] Calling FastAPI /upload endpoint for doc_id=${savedDocument._id}`);
    ragData = await forwardDocumentToRagService(
      savedDocument.path,
      savedDocument.originalName,
      savedDocument._id,
      userId
    );
  } catch (ragErr) {
    console.error(`[RAG ERROR] Document ${savedDocument._id} saved in MongoDB, but RAG indexing failed:`, ragErr.message);
    ragData = {
      status: 'failed',
      error: ragErr.message,
    };
  }

  return {
    ...savedDocument.toObject(),
    rag: ragData,
  };
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
