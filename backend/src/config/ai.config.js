/**
 * Centralized AI Provider Configuration
 * Standardizes OpenRouter as the sole AI provider for the application.
 */

export const getAiConfig = () => {
  return {
    aiProvider: 'OpenRouter',
    model: process.env.OPENROUTER_MODEL || 'openrouter/free',
    baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY || '',
  };
};

export const aiConfig = getAiConfig();
