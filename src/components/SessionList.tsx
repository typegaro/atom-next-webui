"use client";

import type { SessionInfo } from "@/lib/types";

interface SessionListProps {
  sessions: SessionInfo[];
  onLoadSession: (sessionId: string) => void;
  onNewChat: () => void;
}

/**
 * Sidebar session list showing recent conversations.
 */
export function SessionList({
  sessions,
  onLoadSession,
  onNewChat,
}: SessionListProps) {
  return (
    <>
      {/* New chat button */}
      <div className="px-2 py-1">
        <button
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-text-muted hover:bg-surface-hover hover:text-text transition-colors w-full"
          onClick={onNewChat}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          New chat
        </button>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {sessions.length > 0 && (
          <>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-text-subtle px-2.5 py-1 whitespace-nowrap">
              Recents
            </div>
            {[...sessions].reverse().map((s) => (
              <button
                key={s.id}
                className="block w-full text-left px-2.5 py-1.5 rounded-lg text-[13px] text-text-muted hover:bg-surface-hover hover:text-text transition-colors truncate"
                title={s.id}
                onClick={() => onLoadSession(s.id)}
              >
                {s.title || s.id.slice(0, 24)}
              </button>
            ))}
          </>
        )}
      </div>
    </>
  );
}
