import React from 'react';
import { FileText } from 'lucide-react';

export default function DocumentUploadsChart({ data = [] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-600" />
          <span>Document Uploads Per Day</span>
        </h3>
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full uppercase">
          Bar Chart
        </span>
      </div>

      <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
        {data.map((item, idx) => {
          const heightPct = Math.round((item.count / maxCount) * 100);
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
              <span className="text-[10px] font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.count}
              </span>
              <div className="w-full bg-emerald-50 dark:bg-slate-800 rounded-lg relative overflow-hidden h-full flex items-end">
                <div
                  className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-md transition-all duration-500"
                  style={{ height: `${Math.max(heightPct, 8)}%` }}
                />
              </div>
              <span className="text-[9px] font-bold text-slate-400 truncate max-w-[36px]">
                {item.date.slice(5)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
