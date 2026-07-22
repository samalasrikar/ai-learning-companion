import React from 'react';
import { X, MessageSquare, Bot, User } from 'lucide-react';
import { getAvatarUrl } from '../../context/AuthContext';

export default function ConversationViewerModal({ conversation, onClose }) {
  if (!conversation) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 relative animate-in fade-in zoom-in-95 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {conversation.userId?.avatar ? (
              <img
                src={getAvatarUrl(conversation.userId.avatar)}
                alt="Student Avatar"
                className="w-10 h-10 rounded-full object-cover border"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-700 font-bold flex items-center justify-center text-sm border">
                {conversation.userId?.firstName ? conversation.userId.firstName[0] : 'S'}
              </div>
            )}
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>{conversation.title || 'AI Chat Session'}</span>
              </h3>
              <p className="text-xs text-slate-500">
                Student:{' '}
                <strong className="text-slate-700 dark:text-slate-300">
                  {conversation.userId
                    ? `${conversation.userId.firstName} ${conversation.userId.lastName}`
                    : 'Unknown Student'}
                </strong>{' '}
                ({conversation.userId?.email || 'N/A'})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Read-Only Chat Messages Body */}
        <div className="flex-grow overflow-y-auto p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 custom-scrollbar">
          {conversation.messages && conversation.messages.length > 0 ? (
            conversation.messages.map((msg) => (
              <div
                key={msg._id}
                className={`flex gap-3 items-start ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 text-xs shadow-xs mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  <div
                    className={`text-[9px] mt-1 font-medium text-right ${
                      msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                    {conversation.userId?.firstName ? conversation.userId.firstName[0] : 'S'}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-xs text-slate-400 italic">
              No messages found in this conversation session.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-medium text-xs rounded-xl hover:bg-slate-800 transition-all"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}
