import { generateCompletion } from '../providers/openrouter.provider.js';

/**
 * Handles chat logic and returns AI generated response.
 * @param {string} message - The user prompt message.
 * @returns {Promise<string>} The generated text response.
 */
export const processChat = async (message) => {
  if (!message) {
    const err = new Error('Message is required');
    err.status = 400;
    throw err;
  }

  const messages = [
    { role: 'system', content: 'You are a helpful and intelligent learning companion. Explain concepts clearly and concisely.' },
    { role: 'user', content: message }
  ];

  const data = await generateCompletion(messages);
  
  const textResponse = data?.choices?.[0]?.message?.content;
  if (!textResponse) {
    throw new Error('No content returned from AI provider');
  }

  return textResponse;
};
