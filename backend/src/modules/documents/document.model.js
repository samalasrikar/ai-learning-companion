import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  originalName: {
    type: String,
    required: [true, 'Original filename is required'],
  },
  filename: {
    type: String,
    required: [true, 'Unique filename is required'],
    unique: true,
  },
  path: {
    type: String,
    required: [true, 'File storage path is required'],
  },
  size: {
    type: Number,
    required: [true, 'File size in bytes is required'],
  },
  extractedText: {
    type: String,
    required: [true, 'Extracted text content is required'],
  },
  pages: {
    type: Number,
    required: [true, 'PDF page count is required'],
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const Document = mongoose.model('Document', documentSchema);

export default Document;
