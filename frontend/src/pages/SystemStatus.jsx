import React, { useState, useEffect } from 'react';
import { Activity, HardDrive, ShieldCheck, Wrench, Download, RefreshCw, Bell, Search } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

export default function SystemStatus() {
  const [statusList, setStatusList] = useState([]);
  const [storage, setStorage] = useState(null);
  const [loginStats, setLoginStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const [resStatus, resStorage, resLogin, resNotif] = await Promise.all([
        api.get('/admin/system-status'),
        api.get('/admin/storage'),
        api.get('/admin/login-stats', { params: { search: searchQuery } }),
        api.get('/admin/notifications'),
      ]);

      if (resStatus.data?.success) setStatusList(resStatus.data.status || []);
      if (resStorage.data?.success) setStorage(resStorage.data.storage || null);
      if (resLogin.data?.success) setLoginStats(resLogin.data || null);
      if (resNotif.data?.success) setNotifications(resNotif.data.notifications || []);
    } catch (error) {
      toast.error('Failed to load system status data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStatus();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleClearCache = async () => {
    if (!window.confirm('Clear all temporary cached files and AI response buffers?')) return;
    try {
      const res = await api.post('/admin/maintenance/clear-cache');
      if (res.data?.success) toast.success(res.data.message);
    } catch (err) {
      toast.error('Maintenance task failed');
    }
  };

  const handleReindex = async () => {
    if (!window.confirm('Rebuild document indexes and clean orphaned uploads?')) return;
    try {
      const res = await api.post('/admin/maintenance/reindex');
      if (res.data?.success) toast.success(res.data.message);
    } catch (err) {
      toast.error('Maintenance task failed');
    }
  };

  const handleExport = async (type) => {
    try {
      const res = await api.get('/admin/export', { params: { type, format: 'csv' } });
      if (res.data?.success && res.data.data) {
        const jsonStr = JSON.stringify(res.data.data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `jarvis_${type}_export.json`;
        a.click();
        toast.success(`Exported ${type} data successfully`);
      }
    } catch (err) {
      toast.error('Export failed');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
            <Activity className="w-4 h-4" /> Platform Diagnostics
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">System Status & Maintenance</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Monitor microservice health, storage allocation, user logins, and trigger platform maintenance</p>
        </div>
        <button
          onClick={fetchStatus}
          className="inline-flex items-center gap-2 h-10 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-medium text-sm rounded-xl transition-all shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Diagnostics</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-xs text-slate-400">Checking core microservices health...</div>
      ) : (
        <>
          {/* Services Health Grid */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Core Services Status</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {statusList.map((svc) => (
                <div
                  key={svc.name}
                  className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-slate-100">{svc.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Checked just now</div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10px] ${
                      svc.status === 'Healthy'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {svc.status === 'Healthy' ? '🟢 Online' : '🟡 Warning'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Storage & Login Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Storage Usage Widget */}
            {storage && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <HardDrive className="w-4 h-4 text-blue-600" />
                  <span>Storage Usage & Allocation</span>
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between font-bold">
                    <span>Used Space: {storage.totalStorageMB} MB</span>
                    <span>Cap: {storage.maxStorageCapacityMB} MB</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${storage.percentUsed}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2 text-[11px]">
                    <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                      <span className="text-slate-400 block font-semibold">Total Uploaded Documents</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{storage.totalDocuments}</span>
                    </div>
                    <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                      <span className="text-slate-400 block font-semibold">Avg File Size</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{storage.avgFileSizeMB} MB</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Maintenance & Data Export Section */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Wrench className="w-4 h-4 text-purple-600" />
                <span>Maintenance & Data Export</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleClearCache}
                    className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    Clear Temp Cache
                  </button>
                  <button
                    onClick={handleReindex}
                    className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    Rebuild Indexes
                  </button>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span className="font-bold block text-slate-500 mb-2 uppercase text-[10px]">Export System Data (CSV/JSON)</span>
                  <div className="flex flex-wrap gap-2">
                    {['students', 'documents', 'conversations', 'logs'].map((t) => (
                      <button
                        key={t}
                        onClick={() => handleExport(t)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold rounded-lg hover:bg-blue-100 transition-all text-[11px] capitalize"
                      >
                        <Download className="w-3 h-3" />
                        <span>{t}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
