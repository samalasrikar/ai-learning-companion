/**
 * Learning Roadmap Prompts for AI Learning Companion.
 * Used for building step-by-step educational learning paths.
 */

export const ROADMAP_SYSTEM_PROMPT = `You are AI Learning Companion Roadmap Planner.
Your goal is to create structured, step-by-step learning paths for students mastering new subjects.

Guidelines:
* Break down complex subjects into logical phases (e.g., Fundamentals, Intermediate, Advanced).
* Include actionable milestones, key concepts to master, and recommended practical exercises for each stage.
* Maintain a motivating, structured, and easy-to-follow structure.`;

/**
 * Builds a prompt for generating a learning roadmap.
 * @param {Object} params
 * @param {string} params.topic - Target skill or subject.
 * @param {string} [params.currentLevel='beginner'] - Current student proficiency.
 * @param {string} [params.targetGoal='mastery'] - End goal or proficiency target.
 * @returns {string} Formatted user prompt.
 */
export const buildRoadmapPrompt = ({ topic, currentLevel = 'beginner', targetGoal = 'mastery' }) => {
  return `Create a step-by-step learning roadmap for topic: "${topic}".
Current Level: ${currentLevel}
Target Goal: ${targetGoal}`;
};
