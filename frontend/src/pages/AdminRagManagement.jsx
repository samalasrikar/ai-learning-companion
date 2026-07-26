import React, { useState, useEffect } from 'react';
import {
  Database,
  Layers,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Trash2,
  RotateCw,
  Cloud,
  FileText,
  ShieldAlert,
  Server,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import ConfirmDialog from '../components/common/ConfirmDialog';

export default function AdminRagManagement() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  // Confirm dialog state
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    description: '',
    itemName: '',
    confirmText: '',
    variant: 'danger',
    onConfirm: null,
  });

  const fetchRagStats = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/rag/stats');
      if (res.data?.success) {
        setStats(res.data);
      }
    } catch (error) {
      toast.error('Failed to load RAG statistics from service', {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRagStats();
  }, []);

  const requestReindexDocument = (documentId, filename) => {
    setConfirmState({
      isOpen: true,
      title: 'Re-index Vector Embeddings',
      description: 'Are you sure you want to re-index vectors for this document in Chroma Cloud?',
      itemName: filename || documentId,
      confirmText: 'Re-index Vectors',
      variant: 'warning',
      onConfirm: () => executeReindexDocument(documentId, filename),
    });
  };

  const executeReindexDocument = async (documentId, filename) => {
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
    setActionLoading((prev) => ({ ...prev, [documentId]: 'reindex' }));
    const toastId = toast.loading(`Clearing vectors for ${filename}...`);
    try {
      const res = await api.post(`/admin/rag/reindex/${documentId}`);
      if (res.data?.success) {
        toast.success(`Document cleared for re-indexing`, { id: toastId });
        await fetchRagStats();
      }
    } catch (error) {
      toast.error(`Re-indexing failed`, {
        id: toastId,
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [documentId]: null }));
    }
  };

  const requestDeleteDocumentVectors = (documentId, filename) => {
    setConfirmState({
      isOpen: true,
      title: 'Delete Vector Embeddings',
      description: 'Are you sure you want to delete ALL vector embeddings for this document from Chroma Cloud?',
      itemName: filename || documentId,
      confirmText: 'Delete Vectors',
      variant: 'danger',
      onConfirm: () => executeDeleteDocumentVectors(documentId, filename),
    });
  };

  const executeDeleteDocumentVectors = async (documentId, filename) => {
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
    setActionLoading((prev) => ({ ...prev, [documentId]: 'delete' }));
    const toastId = toast.loading(`Deleting vectors for ${filename}...`);
    try {
      const res = await api.delete(`/admin/rag/documents/${documentId}`);
      if (res.data?.success) {
        toast.success(`Deleted ${res.data.deleted_chunks || 0} vectors successfully from Chroma Cloud`, { id: toastId });
        await fetchRagStats();
      }
    } catch (error) {
      toast.error(`Deletion failed`, {
        id: toastId,
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [documentId]: null }));
    }
  };

  const requestRebuildVectorStore = () => {
    setConfirmState({
      isOpen: true,
      title: 'Reset Chroma Cloud Vector Store',
      description: 'Are you sure you want to reset the Chroma Cloud vector store? This will delete the documents collection from your Chroma Cloud database.',
      itemName: 'documents collection',
      confirmText: 'Reset Vector Store',
      variant: 'danger',
      onConfirm: executeRebuildVectorStore,
    });
  };

  const executeRebuildVectorStore = async () => {
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
    const toastId = toast.loading('Resetting Chroma Cloud vector store...');
    try {
      const res = await api.post('/admin/rag/rebuild');
      if (res.data?.success) {
        toast.success('Chroma Cloud vector store reset successfully', { id: toastId });
        await fetchRagStats();
      }
    } catch (error) {
      toast.error('Rebuild failed', {
        id: toastId,
        description: error.response?.data?.message || error.message,
      });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary mb-1">
            <Cloud className="w-4 h-4" /> Vector Database Control
          </div>
          <h1 className="text-3xl font-extrabold text-foreground">Chroma Cloud RAG Management</h1>
          <p className="text-sm text-muted-foreground">Monitor vector collections, inspect indexed documents, and manage cloud embeddings</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchRagStats}
            className="inline-flex items-center gap-2 h-10 px-4 bg-muted hover:bg-muted/80 text-foreground font-medium text-sm rounded-xl transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={requestRebuildVectorStore}
            className="inline-flex items-center gap-2 h-10 px-4 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium text-sm rounded-xl transition-all shadow-sm"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Reset Collection</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Card */}
        <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Storage Mode</span>
            <Server className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-foreground flex items-center gap-2">
            <span>{stats?.mode || 'Chroma Cloud'}</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Connected
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground truncate">
            Tenant: {stats?.tenant ? `${stats.tenant.slice(0, 8)}...` : 'N/A'} | DB: {stats?.database || 'default'}
          </p>
        </div>

        {/* Collection Count Card */}
        <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Collection Name</span>
            <Database className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-bold text-foreground">
            {stats?.collection_name || 'documents'}
          </div>
          <p className="text-[11px] text-muted-foreground">Cosine Distance HNSW Index</p>
        </div>

        {/* Indexed Chunks Card */}
        <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Vector Chunks</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-foreground">
            {stats?.total_chunks ?? (isLoading ? '...' : 0)}
          </div>
          <p className="text-[11px] text-muted-foreground">
            From {stats?.total_documents ?? 0} uploaded document files
          </p>
        </div>

        {/* Embedding Model Card */}
        <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Embedding Model</span>
            <Cpu className="w-4 h-4 text-violet-500" />
          </div>
          <div className="text-sm font-bold text-foreground truncate">
            {stats?.embedding_model || 'BAAI/bge-small-en-v1.5'}
          </div>
          <p className="text-[11px] text-muted-foreground">Dimension: {stats?.embedding_dimension || 384}d</p>
        </div>
      </div>

      {/* Indexed Documents Table */}
      <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <span>Indexed Document Embeddings</span>
            </h2>
            <p className="text-xs text-muted-foreground">Documents currently chunked and stored as vectors in Chroma Cloud</p>
          </div>
          <span className="text-xs font-bold bg-muted text-foreground px-3 py-1 rounded-full">
            {stats?.indexed_documents?.length || 0} Documents
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="uppercase bg-muted/50 text-muted-foreground border-b border-border/50">
              <tr>
                <th className="px-4 py-3 font-semibold">Document ID</th>
                <th className="px-4 py-3 font-semibold">Filename</th>
                <th className="px-4 py-3 font-semibold">Student ID</th>
                <th className="px-4 py-3 font-semibold text-center">Chunks</th>
                <th className="px-4 py-3 font-semibold">Upload Date</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-foreground">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-muted-foreground">
                    Fetching vector index stats...
                  </td>
                </tr>
              ) : stats?.indexed_documents?.length > 0 ? (
                stats.indexed_documents.map((doc) => (
                  <tr key={doc.document_id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">
                      {doc.document_id}
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground max-w-xs truncate">
                      {doc.filename}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {doc.user_id}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary">
                        {doc.chunk_count} chunks
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {doc.upload_date ? new Date(doc.upload_date).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => requestReindexDocument(doc.document_id, doc.filename)}
                          disabled={actionLoading[doc.document_id] === 'reindex'}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                          title="Clear vectors to force re-indexing"
                        >
                          <RotateCw className={`w-3.5 h-3.5 ${actionLoading[doc.document_id] === 'reindex' ? 'animate-spin' : ''}`} />
                          <span>Re-index</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => requestDeleteDocumentVectors(doc.document_id, doc.filename)}
                          disabled={actionLoading[doc.document_id] === 'delete'}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                          title="Delete vector embeddings from Chroma Cloud"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Vectors</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-muted-foreground space-y-1">
                    <p className="font-semibold text-foreground">No document vectors currently indexed in Chroma Cloud</p>
                    <p>Upload documents via the Document Portal to generate and store cloud embeddings.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shared Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        description={confirmState.description}
        itemName={confirmState.itemName}
        confirmText={confirmState.confirmText}
        variant={confirmState.variant}
      />
    </div>
  );
}
