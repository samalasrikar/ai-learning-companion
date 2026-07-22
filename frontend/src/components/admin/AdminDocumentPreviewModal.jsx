import React from 'react';
import { FileText, Download, X } from 'lucide-react';

export default function AdminDocumentPreviewModal({ document, onClose, getFileUrl }) {
  if (!document) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <span>Extracted Text Content</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{document.originalName}</p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl max-h-96 overflow-y-auto custom-scrollbar border text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap">
          {document.extractedText || 'No text extracted.'}
        </div>

        <div className="flex justify-between items-center pt-2">
          <a
            href={getFileUrl(document.path)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Open Original PDF</span>
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-medium text-xs rounded-xl hover:bg-slate-800 transition-all"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
