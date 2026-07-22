import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  getMe,
  updateMe,
  updateAvatar,
  getUsers,
  getUserById,
  toggleUserStatus,
} from './user.controller.js';
import { authenticateUser, authorizeAdmin } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Multer configuration for Avatar Image uploads
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `avatar-${uniqueSuffix}${path.extname(file.originalname).toLowerCase()}`);
  },
});

const avatarFileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

  if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid image format. Supported formats: JPG, JPEG, PNG, WEBP.'), false);
  }
};

const avatarUpload = multer({
  storage: avatarStorage,
  fileFilter: avatarFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MB max file size
  },
});

// User Profile routes (Authenticated User)
router.get('/me', authenticateUser, getMe);
router.patch('/me', authenticateUser, updateMe);
router.patch('/me/avatar', authenticateUser, avatarUpload.single('avatar'), updateAvatar);

// Admin Only User Management routes (Admin access to Student accounts)
router.get('/', authenticateUser, authorizeAdmin, getUsers);
router.get('/:id', authenticateUser, authorizeAdmin, getUserById);
router.patch('/:id/status', authenticateUser, authorizeAdmin, toggleUserStatus);

// Local router error handler for Multer avatar validation errors
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'Image file size exceeds the 2 MB limit.' });
    }
    return res.status(400).json({ success: false, message: `Upload Error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
});

export default router;
