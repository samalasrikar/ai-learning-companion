import React from 'react';
import { X, Mail, FileText, MessageSquare, Bot } from 'lucide-react';
import { getAvatarUrl } from '../../context/AuthContext';

export default function StudentDetailsModal({ student, onClose }) {
  if (!student) return null;

  const aiUsage = student.aiUsage || {
    totalConversations: 0,
    totalMessages: 0,
    lastAiActivity: null,
    avgMessagesPerConversation: 0,
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          {student.avatar ? (
            <img
              src={getAvatarUrl(student.avatar)}
              alt="Student Avatar"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-500/20 shadow-md"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-700 font-bold text-2xl flex items-center justify-center border">
              {student.firstName?.[0] || 'S'}
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {student.firstName} {student.lastName}
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5" />
              {student.email}
            </p>
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 uppercase tracking-wider">
              Student Account
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Joined Date</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100 block">
              {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Last Login</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100 block">
              {student.lastLogin ? new Date(student.lastLogin).toLocaleString() : 'Never'}
            </span>
          </div>
        </div>

        {/* Student AI Usage Section */}
        <div className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-4">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Bot className="w-4 h-4 text-blue-600" />
            <span>AI Learning Usage</span>
          </h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">Total Conversations</span>
              <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">{aiUsage.totalConversations}</span>
            </div>
            <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-xl">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">Total Messages</span>
              <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">{aiUsage.totalMessages}</span>
            </div>
            <div className="p-3 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 rounded-xl">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">Avg Msgs / Chat</span>
              <span className="text-base font-extrabold text-purple-600 dark:text-purple-400">{aiUsage.avgMessagesPerConversation}</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">Last AI Activity</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {aiUsage.lastAiActivity ? new Date(aiUsage.lastAiActivity).toLocaleDateString() : 'Never'}
              </span>
            </div>
          </div>
        </div>

        {/* Documents Uploaded Section */}
        <div className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-4">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Uploaded Documents</span>
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-full">
              {student.documentsUploaded || 0} Total
            </span>
          </h4>

          {student.documents && student.documents.length > 0 ? (
            <div className="space-y-2 max-h-36 overflow-y-auto custom-scrollbar">
              {student.documents.map((doc) => (
                <div key={doc._id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[240px]">{doc.originalName}</span>
                  <span className="text-[10px] text-slate-400">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic text-center py-2">No documents uploaded by this student yet.</p>
          )}
        </div>

        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-medium text-xs rounded-xl hover:bg-slate-800 transition-all"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
