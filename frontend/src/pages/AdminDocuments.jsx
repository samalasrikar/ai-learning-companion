import React, { useState, useEffect } from 'react';
import { FileText, Search, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import AdminDocumentTable from '../components/admin/AdminDocumentTable';
import AdminDocumentPreviewModal from '../components/admin/AdminDocumentPreviewModal';
import ConfirmDialog from '../components/common/ConfirmDialog';

export default function AdminDocuments() {
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/documents', {
        params: { search: searchQuery },
      });
      if (res.data?.success) {
        setDocuments(res.data.documents || []);
      }
    } catch (error) {
      toast.error('Failed to load documents from database');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDocuments();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const requestDeleteDocument = (docId, docName) => {
    setDeleteTarget({ id: docId, name: docName });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await api.delete(`/admin/documents/${deleteTarget.id}`);
      if (res.data?.success) {
        toast.success(`Deleted "${deleteTarget.name}" successfully`);
        setDocuments((prev) => prev.filter((d) => d._id !== deleteTarget.id));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete document');
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const getFileUrl = (filePath) => {
    if (!filePath) return '';
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath;
    const backendBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    const cleanPath = filePath.replace(/\\/g, '/');
    return `${backendBase}/${cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath}`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
            <FileText className="w-4 h-4" /> Document Management
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">Uploaded PDF Documents</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Review all uploaded PDF files, preview extracted text, and manage storage</p>
        </div>
        <button
          onClick={fetchDocuments}
          className="inline-flex items-center gap-2 h-10 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-medium text-sm rounded-xl transition-all shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        {/* Search Input Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Documents ({documents.length})</span>
          </h2>
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by file name or student name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Document Table Component */}
        <div className="overflow-x-auto">
          <AdminDocumentTable
            documents={documents}
            isLoading={isLoading}
            onPreview={(doc) => setPreviewDoc(doc)}
            onDelete={requestDeleteDocument}
            getFileUrl={getFileUrl}
          />
        </div>
      </div>

      {/* Document Preview Modal Component */}
      <AdminDocumentPreviewModal
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
        getFileUrl={getFileUrl}
      />

      {/* Shared Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Document"
        description="Are you sure you want to delete this document? This will remove the file from MongoDB and storage."
        itemName={deleteTarget?.name}
        confirmText="Delete Document"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
