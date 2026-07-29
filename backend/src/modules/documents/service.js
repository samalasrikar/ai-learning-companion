import fs from 'fs';
import Document from './document.model.js';
import { extractPdfData } from './pdf.service.js';
import { forwardDocumentToRagService, deleteDocumentVectorsRagService } from '../../services/ragClient.service.js';

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

/**
 * Delete a document by ID and clean up physical file, RAG vectors, and DB record.
 * @param {string} documentId - MongoDB Document ObjectId string.
 * @param {string} [userId] - Optional uploader user ID.
 */
export const deleteDocumentService = async (documentId, userId) => {
  const document = await Document.findById(documentId);
  if (!document) {
    const err = new Error('Document not found');
    err.status = 404;
    throw err;
  }

  // 1. Delete physical PDF file from uploads directory if exists
  if (document.path && fs.existsSync(document.path)) {
    try {
      fs.unlinkSync(document.path);
    } catch (unlinkErr) {
      console.error('[DELETE ERROR] Failed to delete file on disk:', unlinkErr);
    }
  }

  // 2. Delete vector embeddings from RAG service / Chroma Cloud
  try {
    await deleteDocumentVectorsRagService(documentId);
  } catch (ragErr) {
    console.error(`[DELETE ERROR] Failed to delete vectors for doc ${documentId}:`, ragErr.message);
  }

  // 3. Delete metadata record from MongoDB
  await Document.findByIdAndDelete(documentId);
  return document;
};

/**
 * Fetch a document by ID and verify its physical file exists on disk.
 * @param {string} documentId - MongoDB Document ObjectId string.
 * @returns {Promise<Object>} Document model instance.
 */
export const getDocumentByIdService = async (documentId) => {
  const document = await Document.findById(documentId);
  if (!document) {
    const err = new Error('Document not found');
    err.status = 404;
    throw err;
  }
  if (!document.path || !fs.existsSync(document.path)) {
    const err = new Error('File not found on disk');
    err.status = 404;
    throw err;
  }
  return document;
};


