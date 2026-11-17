import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  onConfirm,
  onCancel
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-lg p-5 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-md border flex items-center justify-center shrink-0 ${
                tone === 'danger'
                  ? 'bg-rose-950/50 border-rose-800/60 text-rose-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-300'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-100 leading-snug">
              {title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="p-1 text-zinc-400 hover:text-zinc-100 rounded hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          {message}
        </p>

        <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded border border-zinc-800 text-zinc-300 hover:bg-zinc-900 text-xs font-medium transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-3.5 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
              tone === 'danger'
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-zinc-100 hover:bg-white text-zinc-950'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
