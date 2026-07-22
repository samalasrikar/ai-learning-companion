import asyncHandler from 'express-async-handler';
import { processChat } from '../../ai/services/chat.service.js';

/**
 * Handles chat prompts from users.
 * Supports documentId mapping for context retrieval.
 * @route   POST /api/chat
 */
export const handleChat = asyncHandler(async (req, res) => {
  const { message, documentId } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    res.status(400);
    throw new Error('Please provide a valid message');
  }

  const responseText = await processChat(message, documentId);

  res.status(200).json({
    success: true,
    response: responseText,
  });
});
