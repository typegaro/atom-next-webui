"use client";

import { useEffect, useCallback } from "react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Dismissible confirmation modal with Escape key and backdrop click support.
 * Replaces browser `confirm()` dialogs with a styled overlay.
 */
export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onCancel();
    },
    [onCancel],
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Modal box */}
      <div className="relative z-10 bg-surface border border-border rounded-xl w-full max-w-sm overflow-hidden shadow-xl">
        {/* Header */}
        <div className="px-5 pt-5 pb-2">
          <h3 className="text-base font-semibold text-text">{title}</h3>
        </div>

        {/* Body */}
        <div className="px-5 pb-4">
          <p className="text-sm text-text-muted leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 px-5 pb-4">
          <button
            className="px-4 py-2 rounded-lg text-sm text-text-muted hover:bg-surface-hover hover:text-text transition-colors"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-500 transition-colors"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
