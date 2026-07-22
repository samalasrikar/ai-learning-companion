import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import fs from 'fs';
import chatRoutes from './modules/chat/chat.routes.js';
import documentsRoutes from './modules/documents/routes.js';
import { errorHandler } from './middleware/error.middleware.js';

// Auto-scaffold uploads directory if it does not exist on boot
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}
if (!fs.existsSync('uploads/documents')) {
  fs.mkdirSync('uploads/documents');
}

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Healthcheck Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
  });
});

// Register Routes
app.use('/api', chatRoutes);
app.use('/api/documents', documentsRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
