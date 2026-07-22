/**
 * Quiz Generator Prompts for AI Learning Companion.
 * Used for generating multiple-choice quizzes and flashcards.
 */

export const QUIZ_SYSTEM_PROMPT = `You are AI Learning Companion Quiz Generator.
Your task is to generate clear, high-quality educational quizzes based on a specified topic or provided document context.

Guidelines:
* Questions must be clear, unambiguous, and educational.
* Provide multiple-choice options (A, B, C, D) with exactly one correct answer.
* Include a brief explanation for why the correct answer is right.
* Format output as clean JSON when requested or as clear readable markdown.`;

/**
 * Builds a prompt for generating a quiz.
 * @param {Object} params
 * @param {string} params.topic - The subject topic.
 * @param {number} [params.numQuestions=5] - Number of questions to generate.
 * @param {string} [params.difficulty='medium'] - Difficulty level ('easy', 'medium', 'hard').
 * @param {string} [params.documentContext] - Optional document context to base the quiz on.
 * @returns {string} Formatted user prompt.
 */
export const buildQuizPrompt = ({ topic, numQuestions = 5, difficulty = 'medium', documentContext }) => {
  let prompt = `Generate a ${numQuestions}-question ${difficulty} quiz on topic: "${topic}".`;

  if (documentContext) {
    prompt += `\n\nBase the questions on the following context:\n<Context>\n${documentContext}\n</Context>`;
  }

  return prompt;
};
