import React, { useState, useEffect } from 'react';
import { Loader2, Download, ExternalLink, AlertCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { fetchDocumentBlob, downloadDocumentFile } from '@/services/document.service';

/**
 * PDF Document Viewer Modal Component
 * Renders authenticated PDF stream inline with loading skeleton, error fallback, and full download support.
 */
export default function DocumentViewerDialog({
  isOpen,
  document: doc,
  onClose,
  onDownload,
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [activeDoc, setActiveDoc] = useState(doc);

  useEffect(() => {
    if (doc) {
      setActiveDoc(doc);
    }
  }, [doc]);

  const docName = activeDoc?.name || activeDoc?.originalName || 'Document';
  const docId = activeDoc?.id || activeDoc?._id;

  useEffect(() => {
    let currentUrl = null;
    let isSubscribed = true;

    const loadPdf = async () => {
      if (!isOpen || !docId) return;

      setLoading(true);
      setError(null);

      try {
        const blob = await fetchDocumentBlob(docId);
        if (!isSubscribed) return;

        const blobUrl = URL.createObjectURL(blob);
        currentUrl = blobUrl;
        setPdfBlobUrl(blobUrl);
      } catch (err) {
        if (!isSubscribed) return;
        console.error('Failed to load PDF preview:', err);
        const errMsg =
          err.response?.data?.message ||
          err.message ||
          'Unable to load PDF document stream from server.';
        setError(errMsg);
        toast.error('Failed to load PDF preview');
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      isSubscribed = false;
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
      setPdfBlobUrl(null);
    };
  }, [isOpen, docId]);

  const handleOpenInNewTab = () => {
    if (pdfBlobUrl) {
      window.open(pdfBlobUrl, '_blank');
    }
  };

  const handleTriggerDownload = async () => {
    if (onDownload && activeDoc) {
      onDownload(activeDoc);
    } else if (docId) {
      try {
        await downloadDocumentFile(docId, docName);
        toast.success('Download started.');
      } catch (err) {
        toast.error('Failed to download document');
      }
    }
  };

  return (
    <Dialog open={Boolean(isOpen)} onOpenChange={(open) => !open && !loading && onClose?.()}>
      <DialogContent
        onEscapeKeyDown={(e) => {
          if (loading) e.preventDefault();
        }}
        onPointerDownOutside={(e) => {
          if (loading) e.preventDefault();
        }}
        className="max-w-5xl w-[92vw] h-[88vh] flex flex-col p-6 bg-card border-border rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header Bar */}
        <DialogHeader className="flex flex-row items-center justify-between gap-4 pb-4 border-b border-border/50 pr-8 shrink-0 text-left">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-primary/10 rounded-xl text-primary shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base font-bold text-foreground truncate max-w-md" title={docName}>
                {docName}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {activeDoc?.size || 'PDF Document'} {activeDoc?.date ? `• ${activeDoc.date}` : ''}
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {pdfBlobUrl && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleOpenInNewTab}
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold h-8 rounded-lg cursor-pointer"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Open in New Tab</span>
              </Button>
            )}

            <Button
              size="sm"
              onClick={handleTriggerDownload}
              className="flex items-center gap-1.5 text-xs font-bold h-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg cursor-pointer transition-colors shadow-sm"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Content Viewer Body */}
        <div className="flex-1 min-h-0 relative w-full mt-4 rounded-xl overflow-hidden bg-muted/30 border border-border/40 flex flex-col items-center justify-center">
          {loading && (
            <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-xs font-semibold">Loading PDF document stream...</p>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center text-center p-8 max-w-md space-y-3">
              <div className="p-3 bg-destructive/10 text-destructive rounded-full">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-foreground">Document Preview Unavailable</h4>
              <p className="text-xs text-muted-foreground">{error}</p>
              <div className="flex items-center gap-3 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setLoading(true);
                    setError(null);
                  }}
                  className="text-xs rounded-lg"
                >
                  Retry Loading
                </Button>
                <Button
                  size="sm"
                  onClick={handleTriggerDownload}
                  className="text-xs font-bold rounded-lg"
                >
                  Download Instead
                </Button>
              </div>
            </div>
          )}

          {!loading && !error && pdfBlobUrl && (
            <object
              data={pdfBlobUrl}
              type="application/pdf"
              className="w-full h-full rounded-xl overflow-hidden"
            >
              <iframe
                src={pdfBlobUrl}
                title={docName}
                className="w-full h-full rounded-xl border-none"
              >
                <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
                  <p className="text-xs text-muted-foreground">
                    PDF embedding is not supported directly by your browser.
                  </p>
                  <Button size="sm" onClick={handleOpenInNewTab} className="text-xs font-bold">
                    Open PDF in New Tab
                  </Button>
                </div>
              </iframe>
            </object>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
