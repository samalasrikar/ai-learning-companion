import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    appName: { type: String, default: 'Jarvis AI' },
    appLogo: { type: String, default: '' },
    defaultAiModel: { type: String, default: process.env.OPENROUTER_MODEL || 'openrouter/free' },
    maxFileSizeMB: { type: Number, default: 20 },
    maxChatHistory: { type: Number, default: 50 },
    allowedFileTypes: { type: [String], default: ['PDF', 'DOCX', 'TXT'] },
    llmProvider: { type: String, default: 'OpenRouter' },
    maxTokens: { type: Number, default: 2048 },
    temperature: { type: Number, default: 0.7 },
    contextWindowSize: { type: Number, default: 8192 },
    maxUploadsPerStudent: { type: Number, default: 50 },
    aiResponseMode: {
      type: String,
      enum: ['strict_rag', 'hybrid', 'general_only'],
      default: 'hybrid',
    },
    similarityThreshold: {
      type: Number,
      default: 0.75,
    },
  },
  { timestamps: true }
);

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
