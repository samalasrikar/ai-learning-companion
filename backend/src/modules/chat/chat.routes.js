import express from 'express';
import { handleChat } from './chat.controller.js';

const router = express.Router();

// POST /api/chat - Route to handle user chat messages
router.post('/chat', handleChat);

export default router;
