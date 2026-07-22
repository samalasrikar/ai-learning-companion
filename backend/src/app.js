import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';

import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/user.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import chatRoutes from './modules/chat/chat.routes.js';
import documentsRoutes from './modules/documents/routes.js';
import { errorHandler } from './middleware/error.middleware.js';

// Auto-scaffold uploads directories if they do not exist on boot
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}
if (!fs.existsSync('uploads/documents')) {
  fs.mkdirSync('uploads/documents');
}
if (!fs.existsSync('uploads/avatars')) {
  fs.mkdirSync('uploads/avatars');
}

const app = express();

// Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(
  cors({
    origin: process.env.SITE_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files (avatars & documents)
app.use('/uploads', express.static(path.resolve('uploads')));

// Healthcheck Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Jarvis backend server is running',
  });
});

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', chatRoutes);
app.use('/api/documents', documentsRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
