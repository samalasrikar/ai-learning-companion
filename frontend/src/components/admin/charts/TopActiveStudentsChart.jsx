import React from 'react';
import { Users } from 'lucide-react';

export default function TopActiveStudentsChart({ data = [] }) {
  const maxMsgs = Math.max(...data.map((d) => d.messages), 1);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Users className="w-4 h-4 text-amber-600" />
          <span>Most Active Students (Top 5)</span>
        </h3>
        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-full uppercase">
          Horizontal Bar
        </span>
      </div>

      <div className="space-y-3.5 pt-2">
        {data.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 italic">No student activity recorded yet</div>
        ) : (
          data.map((student, idx) => {
            const widthPct = Math.round((student.messages / maxMsgs) * 100);
            return (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                    {idx + 1}. {student.name}
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    <strong className="text-amber-600 dark:text-amber-400">{student.messages}</strong> msgs ({student.conversations} chats)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-orange-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(widthPct, 6)}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
