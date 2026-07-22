import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    appName: { type: String, default: 'Jarvis AI' },
    appLogo: { type: String, default: '' },
    defaultAiModel: { type: String, default: 'gemini-1.5-flash' },
    maxFileSizeMB: { type: Number, default: 20 },
    maxChatHistory: { type: Number, default: 50 },
    allowedFileTypes: { type: [String], default: ['PDF', 'DOCX', 'TXT'] },
    llmProvider: { type: String, default: 'Google Gemini' },
    maxTokens: { type: Number, default: 2048 },
    temperature: { type: Number, default: 0.7 },
    contextWindowSize: { type: Number, default: 8192 },
    maxUploadsPerStudent: { type: Number, default: 50 },
  },
  { timestamps: true }
);

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
