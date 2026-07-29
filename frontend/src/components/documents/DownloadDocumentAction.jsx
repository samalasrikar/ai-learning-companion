import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { downloadDocumentFile } from '@/services/document.service';

/**
 * Reusable Download Action Component
 * Handles download request lifecycle, loading state, error toasts, and native binary file saving.
 */
export default function DownloadDocumentAction({
  doc,
  children,
  className = '',
  onDownloadStart,
  onDownloadComplete,
}) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (e) => {
    e?.stopPropagation();
    if (downloading || !doc) return;

    setDownloading(true);
    onDownloadStart?.(doc);

    const docName = doc.name || doc.originalName || 'document.pdf';
    const docId = doc.id || doc._id;

    try {
      if (docId) {
        await downloadDocumentFile(docId, docName);
      } else {
        throw new Error('Document ID missing for download');
      }
      toast.success('Download started.');
      onDownloadComplete?.(doc);
    } catch (err) {
      console.error('Download error:', err);
      const errMsg =
        err.response?.data?.message || err.message || 'Failed to download document.';
      toast.error(errMsg);
    } finally {
      setDownloading(false);
    }
  };

  if (typeof children === 'function') {
    return children({ downloading, handleDownload });
  }

  return (
    <button
      type="button"
      disabled={downloading}
      onClick={handleDownload}
      className={className}
    >
      {downloading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Download className="h-3.5 w-3.5" />
      )}
      <span>{downloading ? 'Downloading...' : 'Download File'}</span>
    </button>
  );
}
