import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { deleteDocument } from '@/services/document.service';

/**
 * Reusable Confirmation Dialog for Document Deletion
 * Handles smooth animations, single-execution API calls, keyboard focus, and toast notifications.
 */
export default function DeleteDocumentDialog({
  isOpen,
  document,
  onClose,
  onSuccess,
  onDelete,
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeDoc, setActiveDoc] = useState(document);
  const cancelBtnRef = useRef(null);

  // Preserve document reference during close transition to prevent content flickering
  useEffect(() => {
    if (document) {
      setActiveDoc(document);
    }
  }, [document]);

  const docName = activeDoc?.name || activeDoc?.originalName || 'Document';
  const docId = activeDoc?.id || activeDoc?._id;

  const handleCancel = () => {
    if (isDeleting) return;
    onClose?.();
  };

  const handleDelete = async (e) => {
    e?.preventDefault();
    if (isDeleting || !activeDoc) return;

    setIsDeleting(true);

    try {
      if (onDelete) {
        await onDelete(activeDoc);
      } else if (docId) {
        await deleteDocument(docId);
      }

      toast.success('Document deleted successfully.');
      onSuccess?.(activeDoc);
      onClose?.();
    } catch (error) {
      console.error('Failed to delete document:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to delete document. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenChange = (open) => {
    if (!open && !isDeleting) {
      onClose?.();
    }
  };

  return (
    <AlertDialog open={Boolean(isOpen)} onOpenChange={handleOpenChange}>
      <AlertDialogContent
        onEscapeKeyDown={(e) => {
          if (isDeleting) e.preventDefault();
        }}
        onPointerDownOutside={(e) => {
          if (isDeleting) e.preventDefault();
        }}
        className="max-w-md rounded-2xl p-6 bg-card border-border shadow-2xl"
      >
        <AlertDialogHeader className="space-y-2 text-left">
          <AlertDialogTitle className="text-lg font-bold text-foreground">
            Delete Document?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Are you sure you want to delete &quot;
            <span className="font-semibold text-foreground break-all">{docName}</span>
            &quot;?
            <br />
            <br />
            This action will permanently remove the document and cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-6 flex flex-row items-center justify-end gap-3 sm:space-x-0">
          <AlertDialogCancel
            ref={cancelBtnRef}
            disabled={isDeleting}
            onClick={handleCancel}
            onOpenAutoFocus={(e) => {
              e.preventDefault();
              cancelBtnRef.current?.focus();
            }}
            className="mt-0 h-9 px-4 text-xs font-semibold rounded-xl border-border/60 hover:bg-muted text-foreground transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </AlertDialogCancel>

          <Button
            type="button"
            disabled={isDeleting}
            onClick={handleDelete}
            variant="destructive"
            className="h-9 px-4 text-xs font-bold rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center min-w-[90px]"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete</span>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
