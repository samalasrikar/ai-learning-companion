/**
 * Document Context & Grounding Prompts for AI Learning Companion.
 * Used when a user uploads or references a document during chat.
 */

export const DOCUMENT_SYSTEM_INSTRUCTIONS = `

Document-Based Grounding Rules:
* The user has attached document content for context. Treat this uploaded document as your PRIMARY source of truth.
* If the answer exists within the uploaded document, answer accurately using the document's facts and details.
* If the user's question cannot be answered from the provided document content, explicitly state: "This information is not available in the uploaded document."
* Strictly avoid hallucinating, guessing, or fabricating facts not present in the document.
* If the user explicitly requests external knowledge or general context (e.g. "What else do you know about this beyond the document?"), you may provide external knowledge, but you MUST clearly distinguish between what comes from the document versus external knowledge.`;

/**
 * Returns document-specific system prompt instructions to append to the tutor persona.
 * @returns {string} The document system instructions.
 */
export const getDocumentSystemInstructions = () => {
  return DOCUMENT_SYSTEM_INSTRUCTIONS;
};

/**
 * Formats raw document text or retrieved context chunks into a structured RAG XML block.
 * Prepared for future vector database chunks array or raw string text.
 * 
 * @param {string|Array<{text: string, metadata?: Object}>} context - Text or array of context chunks.
 * @returns {string} Formatted XML-style context block.
 */
export const formatDocumentContext = (context) => {
  if (!context) return '';

  let formattedText = '';

  if (Array.isArray(context)) {
    // RAG-ready: Array of retrieved chunks
    formattedText = context
      .map((chunk, index) => `[Chunk ${index + 1}${chunk.metadata?.page ? ` | Page ${chunk.metadata.page}` : ''}]\n${chunk.text}`)
      .join('\n\n');
  } else if (typeof context === 'string') {
    formattedText = context.trim();
  }

  return `<UploadedDocumentContext>
${formattedText}
</UploadedDocumentContext>`;
};
