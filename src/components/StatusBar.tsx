"use client";

import { abbreviateModel, formatTokens } from "@/lib/utils";

interface StatusBarProps {
  model: string | null;
  isRunning: boolean;
  totalTokens?: number;
  onToggleSidebar?: () => void;
}

/**
 * Bottom status bar showing connection state, active model, and token usage.
 */
export function StatusBar({
  model,
  isRunning,
  totalTokens,
  onToggleSidebar,
}: StatusBarProps) {
  return (
    <div className="flex items-center gap-2.5 px-4 sm:px-[26px] py-[5px] text-xs text-text-muted border-t border-border-soft flex-shrink-0">
      <div
        className={`w-[5px] h-[5px] rounded-full flex-shrink-0 ${
          isRunning
            ? "bg-tool-pending animate-pulse"
            : "bg-text-subtle"
        }`}
      />
      <span>{abbreviateModel(model)}</span>
      <div className="ml-auto flex items-center gap-2">
        {totalTokens !== undefined && totalTokens > 0 && (
          <span>{formatTokens(totalTokens)}</span>
        )}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="icon-btn"
            title="Show sidebar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2.5" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
