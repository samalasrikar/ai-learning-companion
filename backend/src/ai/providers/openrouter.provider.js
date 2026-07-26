import axios from 'axios';
import { getAiConfig } from '../../config/ai.config.js';

const aiConfig = getAiConfig();
const OPENROUTER_API_KEY = aiConfig.apiKey;
const OPENROUTER_MODEL = aiConfig.model;

if (!OPENROUTER_API_KEY) {
  console.warn('OPENROUTER_API_KEY is not set. Chat requests will fail until it is configured.');
}

const openRouterClient = axios.create({
  baseURL: aiConfig.baseUrl,
  headers: {
    'Authorization': `Bearer ${OPENROUTER_API_KEY || ''}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': process.env.SITE_URL || 'http://localhost:5000',
    'X-Title': process.env.SITE_NAME || 'AI Learning Companion',
  },
});

/**
 * Sends a completion request to OpenRouter API.
 * @param {Array<Object>} messages - Array of chat messages in OpenAI format.
 * @param {string} [model] - The AI model to use. Defaults to the configured OpenRouter model.
 * @param {Object} [options] - Additional API parameters (temperature, max_tokens, etc.).
 * @returns {Promise<Object>} The API response data.
 */
export const generateCompletion = async (messages, model = null, options = {}) => {
  if (!OPENROUTER_API_KEY) {
    const err = new Error('OPENROUTER_API_KEY is not configured');
    err.status = 503;
    throw err;
  }

  try {
    const response = await openRouterClient.post('/chat/completions', {
      model: model || getAiConfig().model,
      messages,
      ...options,
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error?.message || error.message;
    const status = error.response?.status || 500;
    const err = new Error(message);
    err.status = status;
    throw err;
  }
};
