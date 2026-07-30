import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, RefreshCw, Cpu, Upload, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

export default function Settings() {
  const [formData, setFormData] = useState({
    maxFileSizeMB: 20,
    maxChatHistory: 50,
    allowedFileTypes: ['PDF', 'DOCX', 'TXT'],
    llmProvider: 'OpenRouter',
    maxTokens: 2048,
    temperature: 0.7,
    contextWindowSize: 8192,
    maxUploadsPerStudent: 50,
    aiResponseMode: 'hybrid',
    similarityThreshold: 0.75,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/settings');
      if (res.data?.success && res.data.settings) {
        setFormData((prev) => ({ ...prev, ...res.data.settings }));
      }
    } catch (error) {
      toast.error('Failed to load application settings from server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' || type === 'range' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.patch('/admin/settings', formData);
      if (res.data?.success) {
        toast.success(res.data.message || 'Settings persisted to MongoDB successfully');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
            <SettingsIcon className="w-4 h-4" /> System Administration
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">Application Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Configure global parameters for application branding, AI response modes, and document uploads</p>
        </div>
        <button
          onClick={fetchSettings}
          className="inline-flex items-center gap-2 h-10 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-medium text-sm rounded-xl transition-all shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reset Settings</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading settings from MongoDB...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* AI Response Mode & Hybrid RAG Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>AI Response Mode & Hybrid Parameters</span>
            </h3>

            <div className="space-y-4 text-xs">
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase">
                AI Response Mode
              </label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    id: 'strict_rag',
                    label: 'Strict RAG',
                    desc: 'Answer strictly using uploaded documents. Refuse if not found in docs.',
                  },
                  {
                    id: 'hybrid',
                    label: 'Hybrid (Recommended)',
                    desc: 'Use RAG if relevant docs match. Fall back to General AI if no docs match.',
                  },
                  {
                    id: 'general_only',
                    label: 'General AI Only',
                    desc: 'Bypass document vector search and rely purely on General AI knowledge.',
                  },
                ].map((modeOpt) => (
                  <label
                    key={modeOpt.id}
                    className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${
                      formData.aiResponseMode === modeOpt.id
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm mb-1">
                      <input
                        type="radio"
                        name="aiResponseMode"
                        value={modeOpt.id}
                        checked={formData.aiResponseMode === modeOpt.id}
                        onChange={handleChange}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{modeOpt.label}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                      {modeOpt.desc}
                    </span>
                  </label>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase">
                    Vector Similarity Threshold ({formData.similarityThreshold || 0.75})
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      name="similarityThreshold"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={formData.similarityThreshold || 0.75}
                      onChange={handleChange}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 px-2 py-1 bg-indigo-50 dark:bg-indigo-950 rounded-lg">
                      {formData.similarityThreshold || 0.75}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Minimum cosine similarity score required to use document context in Hybrid mode (Default: 0.75).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Configuration Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Cpu className="w-5 h-5 text-purple-600" />
              <span>AI Provider & LLM Parameters</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="space-y-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase">LLM Provider</label>
                <input
                  type="text"
                  name="llmProvider"
                  value={formData.llmProvider}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase">Max Response Tokens</label>
                <input
                  type="number"
                  name="maxTokens"
                  value={formData.maxTokens}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase">Temperature (0.0 - 1.0)</label>
                <input
                  type="number"
                  step="0.1"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Upload Configuration Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Upload className="w-5 h-5 text-emerald-600" />
              <span>Document Upload Restrictions</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase">Max Upload File Size (MB)</label>
                <input
                  type="number"
                  name="maxFileSizeMB"
                  value={formData.maxFileSizeMB}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase">Max Uploads Per Student</label>
                <input
                  type="number"
                  name="maxUploadsPerStudent"
                  value={formData.maxUploadsPerStudent}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving to MongoDB...' : 'Save All Settings'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
