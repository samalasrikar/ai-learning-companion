import React, { useState, useEffect } from 'react';
import { ShieldAlert, Search, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/activity-logs', {
        params: { search: searchQuery, action: actionFilter },
      });
      if (res.data?.success) {
        setLogs(res.data.logs || []);
      }
    } catch (error) {
      toast.error('Failed to load system activity logs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, actionFilter]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-1">
            <ShieldAlert className="w-4 h-4" /> System Audit Trail
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">Activity Logs</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Immutable audit record of all user registrations, document uploads, chat sessions, and administrative actions</p>
        </div>
        <button
          onClick={fetchLogs}
          className="inline-flex items-center gap-2 h-10 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-medium text-sm rounded-xl transition-all shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Logged Events ({logs.length})</span>
          </h2>
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search user, action, or target resource..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400 text-sm">Loading activity log history...</div>
          ) : logs.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">No activity logs recorded</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="uppercase bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Action Performed</th>
                  <th className="px-4 py-3 font-semibold">Target Resource</th>
                  <th className="px-4 py-3 font-semibold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100">{log.userName}</td>
                    <td className="px-4 py-3 font-semibold">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] ${
                          log.role === 'Admin'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        }`}
                      >
                        {log.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">{log.action}</td>
                    <td className="px-4 py-3 text-slate-500 truncate max-w-xs">{log.targetResource || 'N/A'}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
