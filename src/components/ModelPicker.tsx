"use client";

import { useEffect } from "react";
import type { ModelInfo } from "@/lib/types";

interface ModelPickerProps {
  open: boolean;
  models: ModelInfo[];
  activeModel: string | null;
  onSelect: (modelId: string) => void;
  onClose: () => void;
}

/**
 * Overlay picker for selecting the active model.
 */
export function ModelPicker({
  open,
  models,
  activeModel,
  onSelect,
  onClose,
}: ModelPickerProps) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="relative bg-surface-panel border border-border rounded-xl p-1.5 w-full max-w-[420px] max-h-[300px] overflow-y-auto z-10">
        {models.map((m) => (
          <button
            key={m.id}
            className={`block w-full text-left px-3.5 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
              m.id === activeModel
                ? "text-text"
                : "text-text-muted hover:bg-surface-hover hover:text-text"
            }`}
            onClick={() => {
              onSelect(m.id);
              onClose();
            }}
          >
            {m.id}
          </button>
        ))}
      </div>
    </div>
  );
}
