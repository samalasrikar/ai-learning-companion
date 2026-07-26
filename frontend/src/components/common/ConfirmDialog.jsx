import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, Info, RefreshCw, X } from 'lucide-react';

/**
 * Shared Delete / Action Confirmation Dialog Box
 * Replaces browser native window.confirm alerts with a sleek, accessible, animated modal.
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  description = 'Are you sure you want to proceed? This action cannot be undone.',
  itemName,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger' | 'warning' | 'info'
  isLoading = false,
  icon,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  // Variant configuration for icon backgrounds, text colors, and button styles
  const variantStyles = {
    danger: {
      badgeBg: 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/40',
      icon: icon || <Trash2 className="w-5 h-5" />,
      buttonBg: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20',
    },
    warning: {
      badgeBg: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/40',
      icon: icon || <AlertTriangle className="w-5 h-5" />,
      buttonBg: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20',
    },
    info: {
      badgeBg: 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/40',
      icon: icon || <Info className="w-5 h-5" />,
      buttonBg: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20',
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.danger;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 transition-opacity duration-200">
      <div
        className="fixed inset-0"
        onClick={() => !isLoading && onClose()}
        aria-hidden="true"
      />

      <div
        className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg p-1 transition-colors disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl border ${currentVariant.badgeBg} shrink-0`}>
            {currentVariant.icon}
          </div>
          <div className="space-y-1 pr-6">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {title}
            </h3>
            <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {description}
              {itemName && (
                <span className="block mt-1 font-semibold text-slate-700 dark:text-slate-200 break-all">
                  "{itemName}"
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 ${currentVariant.buttonBg} font-medium text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 disabled:opacity-50`}
          >
            {isLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
