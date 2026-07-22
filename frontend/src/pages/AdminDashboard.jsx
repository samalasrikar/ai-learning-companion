import React, { useState, useEffect } from 'react';
import {
  Users,
  FileText,
  UserCheck,
  UserPlus,
  RefreshCw,
  Clock,
  Shield,
  FileCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalDocuments: 0,
    activeStudents: 0,
    newStudents: 0,
  });
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/recent-activity').catch(() => ({ data: { activities: [] } })),
      ]);

      if (statsRes.data?.success) {
        setStats({
          totalStudents: statsRes.data.totalStudents || 0,
          totalDocuments: statsRes.data.totalDocuments || 0,
          activeStudents: statsRes.data.activeStudents || 0,
          newStudents: statsRes.data.newStudents || 0,
        });
      }

      if (activityRes.data?.success) {
        setActivities(activityRes.data.activities || []);
      }
    } catch (error) {
      toast.error('Failed to load admin dashboard data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
            <Shield className="w-4 h-4" /> System Administration
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">Admin Control Panel</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Overview of student registrations, documents, and platform activity</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 h-10 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-medium text-sm rounded-xl transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
        </button>
      </div>

      {/* Real Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Students Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Students</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            {isLoading ? '...' : stats.totalStudents}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Registered Student accounts</p>
        </div>

        {/* Uploaded Documents Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Uploaded Documents</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            {isLoading ? '...' : stats.totalDocuments}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Parsed PDFs in MongoDB</p>
        </div>

        {/* Active Students Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active Students</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
            {isLoading ? '...' : stats.activeStudents}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Accounts with active status</p>
        </div>

        {/* New Students Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">New Registrations</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-1">
            {isLoading ? '...' : stats.newStudents}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Joined in the last 7 days</p>
        </div>
      </div>

      {/* Recent Activity Stream Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span>Recent Platform Activity</span>
        </h2>

        {isLoading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading activity stream...</div>
        ) : activities.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">No recent activity</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="uppercase bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Student Name</th>
                  <th className="px-4 py-3 font-semibold">Activity Event</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {activities.map((act, idx) => (
                  <tr key={act.id + idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                      {act.studentName}
                      <div className="text-[10px] text-slate-400 font-normal">{act.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold text-[10px] ${
                        act.type === 'student_registered'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                      }`}>
                        {act.type === 'student_registered' ? <UserPlus className="w-3 h-3" /> : <FileCheck className="w-3 h-3" />}
                        <span>{act.activity}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(act.timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
