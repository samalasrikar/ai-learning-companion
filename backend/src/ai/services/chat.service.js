import { generateCompletion } from '../providers/openrouter.provider.js';
import { getTutorSystemPrompt } from '../prompts/tutor.prompt.js';
import { getDocumentSystemInstructions, formatDocumentContext } from '../prompts/document.prompt.js';
import { retrieveDocumentContext } from './retrieval.service.js';

/**
 * Handles chat logic and returns AI generated response.
 * Preserves full backward compatibility while supporting optional history & RAG retrieval.
 * 
 * Prompt Construction Sequence:
 * System Persona (+ Document Grounding Rules if doc attached)
 * ↓
 * Conversation History (if provided)
 * ↓
 * Retrieved Document Context + User Message
 * 
 * @param {string} message - The user prompt message.
 * @param {string} [documentId] - Optional uploaded document identifier context.
 * @param {Object} [options={}] - Additional chat execution options.
 * @param {Array<{role: string, content: string}>} [options.history=[]] - Conversation history messages.
 * @param {string} [options.model] - Optional LLM model override.
 * @returns {Promise<string>} The generated text response.
 */
export const processChat = async (message, documentId = null, options = {}) => {
  if (!message || typeof message !== 'string' || !message.trim()) {
    const err = new Error('Message is required and must be a non-empty string.');
    err.status = 400;
    throw err;
  }

  // 1. Build Base System Prompt (Preserving Tutor Persona)
  let systemContent = getTutorSystemPrompt();

  // 2. Retrieve Document Context & Append Document Instructions if Document Attached
  let documentContextBlock = '';
  if (documentId) {
    // Append document grounding instructions to system prompt without replacing tutor persona
    systemContent += getDocumentSystemInstructions();

    try {
      const contextData = await retrieveDocumentContext(documentId, message);
      if (contextData) {
        documentContextBlock = formatDocumentContext(contextData);
      }
    } catch (err) {
      console.error(`Error loading document context for ID ${documentId}:`, err.message);
      const error = new Error(`Failed to load document context: ${err.message}`);
      error.status = err.status || 500;
      throw error;
    }
  }

  // 3. Assemble Messages Array following Conversation Context order:
  //    System Prompt -> Conversation History -> Current Message (+ Document Context)
  const messages = [
    {
      role: 'system',
      content: systemContent,
    },
  ];

  // Append Conversation History (if passed in options)
  if (Array.isArray(options.history) && options.history.length > 0) {
    for (const item of options.history) {
      if (item && item.role && item.content) {
        messages.push({
          role: item.role,
          content: item.content,
        });
      }
    }
  }

  // Build Final User Message (with retrieved document context if present)
  let finalUserContent = message.trim();
  if (documentContextBlock) {
    finalUserContent = `${documentContextBlock}\n\nUser Question:\n${finalUserContent}`;
  }

  messages.push({
    role: 'user',
    content: finalUserContent,
  });

  // 4. Call OpenRouter Provider
  try {
    const data = await generateCompletion(messages, options.model);

    const textResponse = data?.choices?.[0]?.message?.content;
    if (!textResponse) {
      const err = new Error('No content returned from AI provider.');
      err.status = 502;
      throw err;
    }

    return textResponse;
  } catch (err) {
    if (!err.status) {
      err.status = 500;
    }
    throw err;
  }
};
