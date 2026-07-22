import { generateCompletion } from '../providers/openrouter.provider.js';
import { getDocumentText } from '../../modules/documents/service.js';

const SYSTEM_PROMPT = `You are AI Learning Companion, an intelligent tutor that teaches students in a clear, engaging, and interactive way.

Guidelines:
* Give concise, well-structured answers.
* Explain concepts in simple language first.
* Use bullet points instead of large markdown tables unless explicitly requested.
* Avoid unnecessary introductions and conclusions.
* Use headings only when they improve readability.
* Keep answers focused on the user's question.
* Break complex topics into small sections.
* Provide examples whenever useful.
* Use code blocks only for programming questions.
* Do not generate huge responses unless the user explicitly asks for a detailed explanation.
* When appropriate, end with a short "Key Takeaway" or "Would you like an example or quiz?" instead of continuing unnecessarily.
* Avoid sounding like ChatGPT or a textbook.
* Respond like a friendly AI tutor.

Response Length:
* Default response length: 100–250 words.
* Maximum 400 words unless the user requests a detailed explanation.

Markdown Rules:
* Use: Short headings, bullet points, numbered lists, and code blocks (only for code).
* Avoid: Large markdown tables, very long paragraphs, decorative formatting, excessive bold text, and repeating the user's question.`;

/**
 * Handles chat logic and returns AI generated response.
 * @param {string} message - The user prompt message.
 * @param {string} [documentId] - Optional uploaded document identifier context.
 * @returns {Promise<string>} The generated text response.
 */
export const processChat = async (message, documentId) => {
  if (!message) {
    const err = new Error('Message is required');
    err.status = 400;
    throw err;
  }

  let systemContent = SYSTEM_PROMPT;
  let userContent = message;

  // If a document context is attached, fetch its content and reconstruct prompt
  if (documentId) {
    try {
      const extractedText = await getDocumentText(documentId);
      
      systemContent = 'You are AI Learning Companion.';
      userContent = `The following document has already been uploaded.

<Document>
${extractedText}
</Document>

User request:
${message}

Answer using ONLY the uploaded document unless the user asks otherwise.`;
    } catch (err) {
      console.error('Failed to load document for chat processing:', err);
      throw new Error(`Failed to load document text context: ${err.message}`);
    }
  }

  const messages = [
    {
      role: 'system',
      content: systemContent,
    },
    {
      role: 'user',
      content: userContent,
    },
  ];

  const data = await generateCompletion(messages);
  
  const textResponse = data?.choices?.[0]?.message?.content;
  if (!textResponse) {
    throw new Error('No content returned from AI provider');
  }

  return textResponse;
};
