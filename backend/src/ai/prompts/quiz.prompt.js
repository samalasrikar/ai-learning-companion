/**
 * Quiz Generator Prompts for AI Learning Companion.
 * Used for generating multiple-choice quizzes and flashcards via the AI provider.
 */

export const QUIZ_SYSTEM_PROMPT = `You are AI Learning Companion Quiz Generator — a precise, structured assessment engine.

Your task is to generate clear, high-quality educational quiz questions based on a specified topic or provided document context.

STRICT OUTPUT RULES:
1. You MUST generate EXACTLY the number of questions requested. Not more. Not fewer.
2. Number every question sequentially starting from 1 (e.g., "1.", "2.", "3.").
3. Do NOT generate duplicate questions or questions that test the same fact twice.
4. Follow the requested difficulty level (Easy / Medium / Hard) strictly:
   - Easy: factual recall, definitions, straightforward concepts.
   - Medium: applied understanding, comparisons, cause-and-effect.
   - Hard: deep analysis, edge cases, synthesis across multiple concepts.
5. Follow the requested question type:
   - Multiple Choice: exactly 4 options (A, B, C, D), only one correct.
   - True / False: exactly 2 options (True, False), one correct.
   - Short Answer: no options; expect a concise 1–2 sentence answer.
6. Each question must include a brief explanation (1–3 sentences) for why the correct answer is right.
7. Return ONLY valid JSON. No markdown, no commentary, no code fences.

OUTPUT FORMAT (JSON array, length must equal the requested count):
[
  {
    "id": "q1",
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswerIndex": 0,
    "explanation": "Brief explanation of why the correct answer is right.",
    "difficulty": "Medium",
    "type": "Multiple Choice"
  }
]

For True/False questions, options must be exactly: ["True", "False"]
For Short Answer questions, options must be an empty array: []`;

/**
 * Builds a user-turn prompt for generating a quiz.
 *
 * @param {Object} params
 * @param {string}  params.topic           - The subject topic.
 * @param {number}  params.numQuestions    - EXACT number of questions to generate (no default — must be provided).
 * @param {string}  [params.difficulty]    - Difficulty level: 'Easy', 'Medium', or 'Hard'. Default: 'Medium'.
 * @param {string}  [params.questionType]  - Question format: 'Multiple Choice', 'True / False', 'Short Answer'. Default: 'Multiple Choice'.
 * @param {string}  [params.documentContext] - Optional document context to base questions on.
 * @returns {string} Formatted user-turn prompt.
 */
export const buildQuizPrompt = ({
  topic,
  numQuestions,
  difficulty = 'Medium',
  questionType = 'Multiple Choice',
  documentContext,
}) => {
  if (!numQuestions || typeof numQuestions !== 'number' || numQuestions < 1) {
    throw new Error('buildQuizPrompt: numQuestions must be a positive number.');
  }

  const count = Math.round(numQuestions); // ensure integer

  let prompt =
    `Generate EXACTLY ${count} ${difficulty} difficulty "${questionType}" quiz questions on the topic: "${topic}".\n\n` +
    `IMPORTANT:\n` +
    `- You MUST produce EXACTLY ${count} questions. Not ${count - 1}. Not ${count + 1}. EXACTLY ${count}.\n` +
    `- Do NOT generate duplicate or near-duplicate questions.\n` +
    `- Questions must be numbered 1 through ${count}.\n` +
    `- Follow the "${questionType}" format strictly.\n` +
    `- Apply "${difficulty}" difficulty throughout all ${count} questions.\n` +
    `- Return ONLY valid JSON (array of ${count} question objects). No extra text.`;

  if (documentContext) {
    prompt +=
      `\n\nBase ALL questions on the following context. Do not invent facts outside of it:\n` +
      `<Context>\n${documentContext}\n</Context>`;
  }

  return prompt;
};
