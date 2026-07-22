import React from 'react';
import { Trash2 } from 'lucide-react';

export default function DeleteConversationModal({ isOpen, title, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-rose-600" />
          <span>Delete Conversation</span>
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Are you sure you want to delete <strong className="text-slate-900 dark:text-slate-100">"{title}"</strong>? This action cannot be undone.
        </p>
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs rounded-xl shadow-xs"
          >
            Delete Chat
          </button>
        </div>
      </div>
    </div>
  );
}
