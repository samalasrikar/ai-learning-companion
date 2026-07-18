import asyncHandler from 'express-async-handler';
import { processChat } from '../ai/services/chat.service.js';

/**
 * @desc    Handle chat prompts
 * @route   POST /api/chat
 * @access  Public
 */
export const handleChat = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    res.status(400);
    throw new Error('Please provide a valid message');
  }

  const responseText = await processChat(message);

  res.status(200).json({
    success: true,
    response: responseText,
  });
});
