import React, { useState, useEffect } from 'react';
import { Users, Search, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import StudentTable from '../components/admin/StudentTable';
import StudentDetailsModal from '../components/admin/StudentDetailsModal';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [studentDetailsModal, setStudentDetailsModal] = useState(null);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/users', {
        params: { search: searchQuery },
      });
      if (res.data?.success) {
        const filtered = (res.data.users || []).filter((u) => u.role === 'Student');
        setStudents(filtered);
      }
    } catch (error) {
      toast.error('Failed to load student list');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleToggleStatus = async (studentId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const res = await api.patch(`/users/${studentId}/status`, { isActive: newStatus });
      if (res.data?.success) {
        toast.success(res.data.message);
        setStudents((prev) =>
          prev.map((s) => (s._id === studentId ? { ...s, isActive: newStatus } : s))
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update student status');
    }
  };

  const handleViewDetails = async (studentId) => {
    try {
      const res = await api.get(`/users/${studentId}`);
      if (res.data?.success && res.data.user) {
        setStudentDetailsModal(res.data.user);
      }
    } catch (error) {
      toast.error('Failed to load student details');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
            <Users className="w-4 h-4" /> Student Management
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">Students Directory</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">View, search, inspect, and toggle active permissions for student accounts</p>
        </div>
        <button
          onClick={fetchStudents}
          className="inline-flex items-center gap-2 h-10 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-medium text-sm rounded-xl transition-all shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Directory</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        {/* Search Input Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Registered Students ({students.length})</span>
          </h2>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Student Table Component */}
        <div className="overflow-x-auto">
          <StudentTable
            students={students}
            isLoading={isLoading}
            onViewDetails={handleViewDetails}
            onToggleStatus={handleToggleStatus}
          />
        </div>
      </div>

      {/* Student Details Modal Component */}
      <StudentDetailsModal
        student={studentDetailsModal}
        onClose={() => setStudentDetailsModal(null)}
      />
    </div>
  );
}
