import React, { useState, useEffect } from 'react';
import { MessageSquare, Search, RefreshCw, Eye, Trash2, Calendar, User } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import { getAvatarUrl } from '../context/AuthContext';
import ConversationViewerModal from '../components/admin/ConversationViewerModal';

export default function AdminChats() {
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [viewConversation, setViewConversation] = useState(null);

  const fetchChats = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/chats', {
        params: { search: searchQuery, filter },
      });
      if (res.data?.success) {
        setConversations(res.data.conversations || []);
      }
    } catch (error) {
      toast.error('Failed to load AI conversations from server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchChats();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, filter]);

  const handleView = async (conversationId) => {
    try {
      const res = await api.get(`/admin/chats/${conversationId}`);
      if (res.data?.success && res.data.conversation) {
        setViewConversation(res.data.conversation);
      }
    } catch (error) {
      toast.error('Failed to load conversation transcript');
    }
  };

  const handleDelete = async (conversationId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}" and all its messages?`)) {
      return;
    }

    try {
      const res = await api.delete(`/admin/chats/${conversationId}`);
      if (res.data?.success) {
        toast.success(`Deleted "${title}" successfully`);
        setConversations((prev) => prev.filter((c) => c._id !== conversationId));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete conversation');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
            <MessageSquare className="w-4 h-4" /> AI Chat Management
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">Student AI Conversations</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Monitor student AI learning chats, inspect read-only transcripts, and manage storage</p>
        </div>
        <button
          onClick={fetchChats}
          className="inline-flex items-center gap-2 h-10 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-medium text-sm rounded-xl transition-all shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Date Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl">
            {[
              { id: 'all', label: 'All Time' },
              { id: 'today', label: 'Today' },
              { id: 'last7days', label: 'Last 7 Days' },
              { id: 'last30days', label: 'Last 30 Days' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === tab.id
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search student or chat title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Conversations Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400 text-sm">Loading AI conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">No AI conversations available</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="uppercase bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Student</th>
                  <th className="px-4 py-3 font-semibold">Conversation Title</th>
                  <th className="px-4 py-3 font-semibold text-center">Messages</th>
                  <th className="px-4 py-3 font-semibold">Last Activity</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {conversations.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium flex items-center gap-3">
                      {c.userId?.avatar ? (
                        <img
                          src={getAvatarUrl(c.userId.avatar)}
                          alt={c.userId.firstName}
                          className="w-8 h-8 rounded-full object-cover border"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-xs border">
                          {c.userId?.firstName ? c.userId.firstName[0] : 'S'}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {c.userId ? `${c.userId.firstName} ${c.userId.lastName}` : 'Student'}
                        </div>
                        <div className="text-[10px] text-slate-400">{c.userId?.email || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100 truncate max-w-xs">
                      {c.title}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-slate-900 dark:text-slate-100">
                      {c.totalMessages || 0}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {c.updatedAt ? new Date(c.updatedAt).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(c._id)}
                          className="px-2.5 py-1.5 rounded-lg font-medium text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 transition-all flex items-center gap-1"
                          title="View Conversation Transcript"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => handleDelete(c._id, c.title)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-all"
                          title="Delete Conversation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Read-Only Transcript Viewer Modal */}
      <ConversationViewerModal
        conversation={viewConversation}
        onClose={() => setViewConversation(null)}
      />
    </div>
  );
}
