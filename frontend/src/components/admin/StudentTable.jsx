import React from 'react';
import { Eye } from 'lucide-react';
import { getAvatarUrl } from '../../context/AuthContext';

export default function StudentTable({ students, isLoading, onViewDetails, onToggleStatus }) {
  if (isLoading) {
    return <div className="py-16 text-center text-slate-400 text-sm">Loading student directory...</div>;
  }

  if (students.length === 0) {
    return <div className="py-16 text-center text-slate-400 text-sm">No student accounts found</div>;
  }

  return (
    <table className="w-full text-left text-xs">
      <thead className="uppercase bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b border-slate-200 dark:border-slate-800">
        <tr>
          <th className="px-4 py-3 font-semibold">Student Profile</th>
          <th className="px-4 py-3 font-semibold">Email</th>
          <th className="px-4 py-3 font-semibold">Status</th>
          <th className="px-4 py-3 font-semibold">Joined Date</th>
          <th className="px-4 py-3 font-semibold text-center">Docs Uploaded</th>
          <th className="px-4 py-3 font-semibold text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
        {students.map((s) => (
          <tr key={s._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
            <td className="px-4 py-3 font-medium flex items-center gap-3">
              {s.avatar ? (
                <img
                  src={getAvatarUrl(s.avatar)}
                  alt={s.firstName}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-xs border border-blue-200 dark:border-blue-800">
                  {s.firstName ? s.firstName[0] : 'S'}
                </div>
              )}
              <div>
                <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                  {s.firstName} {s.lastName}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">Student</div>
              </div>
            </td>
            <td className="px-4 py-3 font-medium">{s.email}</td>
            <td className="px-4 py-3">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-[10px] ${
                  s.isActive
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                }`}
              >
                {s.isActive ? 'Active' : 'Disabled'}
              </span>
            </td>
            <td className="px-4 py-3 text-slate-400">
              {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'N/A'}
            </td>
            <td className="px-4 py-3 text-center font-bold text-slate-900 dark:text-slate-100">
              {s.documentsUploaded || 0}
            </td>
            <td className="px-4 py-3 text-right">
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => onViewDetails(s._id)}
                  className="px-2.5 py-1.5 rounded-lg font-medium text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-1"
                  title="View Details"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Details</span>
                </button>
                <button
                  onClick={() => onToggleStatus(s._id, s.isActive)}
                  className={`px-2.5 py-1.5 rounded-lg font-medium text-xs transition-all border ${
                    s.isActive
                      ? 'border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-950/30'
                      : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900/50 dark:hover:bg-emerald-950/30'
                  }`}
                >
                  {s.isActive ? 'Disable' : 'Enable'}
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
