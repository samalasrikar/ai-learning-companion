import React, { useState, useEffect } from 'react';
import { BarChart3, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import AnalyticsCards from '../components/admin/AnalyticsCards';
import StudentRegistrationsChart from '../components/admin/charts/StudentRegistrationsChart';
import DocumentUploadsChart from '../components/admin/charts/DocumentUploadsChart';
import AiConversationsChart from '../components/admin/charts/AiConversationsChart';
import TopActiveStudentsChart from '../components/admin/charts/TopActiveStudentsChart';

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/analytics');
      if (res.data?.success && res.data.analytics) {
        setAnalytics(res.data.analytics);
      }
    } catch (error) {
      toast.error('Failed to load analytics data from server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">
            <BarChart3 className="w-4 h-4" /> System Analytics
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">Jarvis Platform Analytics</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Real-time usage metrics, AI engagement trends, and student activity insights from MongoDB</p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center gap-2 h-10 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-medium text-sm rounded-xl transition-all shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-24 text-center text-slate-400 text-sm">Loading analytics dashboard...</div>
      ) : !analytics ? (
        <div className="py-24 text-center text-slate-400 text-sm">No analytics data available</div>
      ) : (
        <>
          {/* Real Analytics Stat Cards */}
          <AnalyticsCards analytics={analytics} />

          {/* Grid of 4 Visualization Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <StudentRegistrationsChart data={analytics.registrationsByDay} />
            <DocumentUploadsChart data={analytics.uploadsByDay} />
            <AiConversationsChart data={analytics.conversationsByDay} />
            <TopActiveStudentsChart data={analytics.topActiveStudents} />
          </div>
        </>
      )}
    </div>
  );
}
