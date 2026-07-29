import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  uploadDocumentController,
  getDocumentsController,
  queryDocumentController,
  deleteDocumentController,
  viewDocumentController,
  downloadDocumentController,
} from './controller.js';
import { authenticateUser } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Set storage engine parameters
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/documents/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// Filter helper to enforce PDF-only mime-types
const fileFilter = (req, file, cb) => {
  const isPdfMime = file.mimetype === 'application/pdf';
  const isPdfExt = path.extname(file.originalname).toLowerCase() === '.pdf';

  if (isPdfMime || isPdfExt) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are supported'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // Enforce 20MB file upload limits
  },
});

// Map GET / (list documents), POST /upload (upload PDF), POST /query (RAG question search), DELETE /:id, GET /:id/view, GET /:id/download
router.get('/', authenticateUser, getDocumentsController);
router.post('/upload', authenticateUser, upload.single('file'), uploadDocumentController);
router.post('/query', authenticateUser, queryDocumentController);
router.get('/:id/view', authenticateUser, viewDocumentController);
router.get('/:id/download', authenticateUser, downloadDocumentController);
router.delete('/:id', authenticateUser, deleteDocumentController);

// Local router interceptor to capture Multer validation errors
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    res.status(400).json({ success: false, message: `Multer Error: ${err.message}` });
  } else if (err) {
    res.status(400).json({ success: false, message: err.message });
  } else {
    next();
  }
});

export default router;
