"use client";

import { useState } from "react";
import type { SessionInfo } from "@/lib/types";
import { ConfirmModal } from "./ConfirmModal";
import { Icon } from "./ui/Icon";
import { IconButton } from "./ui/IconButton";

interface SidebarProps {
  visible: boolean;
  sessions: SessionInfo[];
  onNewChat: () => void;
  onLoadSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onToggle: () => void;
}

/**
 * Main sidebar with sessions list and navigation.
 * On mobile (<768px) it becomes a full-screen overlay drawer.
 */
export function Sidebar({
  visible,
  sessions,
  onNewChat,
  onLoadSession,
  onDeleteSession,
  onToggle,
}: SidebarProps) {
  const [deleteTarget, setDeleteTarget] = useState<SessionInfo | null>(null);

  return (
    <>
      <SidebarBackdrop visible={visible} onClick={onToggle} />

      <aside
        className={`
          w-64 flex-shrink-0 flex flex-col overflow-hidden border-r border-border
          transition-all duration-200 ease-in-out bg-surface
          md:relative md:flex
          fixed inset-y-0 left-0 z-40
          ${visible ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-0 md:border-r-0"}
        `}
      >
        <SidebarHeader onToggle={onToggle} />
        <NewChatButton onClick={onNewChat} />
        <SessionList
          sessions={sessions}
          onLoadSession={onLoadSession}
          onRequestDelete={setDeleteTarget}
        />
      </aside>

      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete chat"
        message={`Delete "${sessionTitle(deleteTarget)}"?`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => {
          if (deleteTarget) onDeleteSession(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}

function SidebarBackdrop({ visible, onClick }: { visible: boolean; onClick: () => void }) {
  if (!visible) return null;
  return <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={onClick} />;
}

function SidebarHeader({ onToggle }: { onToggle: () => void }) {
  return (
    <div className="flex items-center px-2.5 py-3 gap-1">
      <IconButton onClick={onToggle} title="Toggle sidebar">
        <Icon name="sidebar" size={18} />
      </IconButton>
    </div>
  );
}

function NewChatButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="px-2 py-1">
      <button
        type="button"
        className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-text-muted hover:bg-surface-hover hover:text-text transition-colors w-full"
        onClick={onClick}
      >
        <Icon name="new-chat" size={15} />
        New chat
      </button>
    </div>
  );
}

interface SessionListProps {
  sessions: SessionInfo[];
  onLoadSession: (sessionId: string) => void;
  onRequestDelete: (session: SessionInfo) => void;
}

function SessionList({ sessions, onLoadSession, onRequestDelete }: SessionListProps) {
  return (
    <div className="flex-1 overflow-y-auto px-2 pb-4">
      {sessions.length > 0 && (
        <>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-text-subtle px-2.5 py-1 whitespace-nowrap">
            Recents
          </div>
          {sessions.map((session) => (
            <SessionRow
              key={session.id}
              session={session}
              onLoadSession={onLoadSession}
              onRequestDelete={onRequestDelete}
            />
          ))}
        </>
      )}
    </div>
  );
}

type SessionRowProps = Omit<SessionListProps, "sessions"> & { session: SessionInfo };

function SessionRow({ session, onLoadSession, onRequestDelete }: SessionRowProps) {
  return (
    <div
      className="group flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[13px] text-text-muted hover:bg-surface-hover hover:text-text transition-colors cursor-pointer"
      title={session.id}
      onClick={() => onLoadSession(session.id)}
    >
      <span className="flex-1 truncate">{sessionTitle(session)}</span>
      <button
        type="button"
        className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-60 group-active:opacity-60 hover:opacity-100 hover:bg-red-500/10 hover:text-red-400 transition-all"
        onClick={(event) => {
          event.stopPropagation();
          onRequestDelete(session);
        }}
        title="Delete chat"
      >
        <Icon name="more" size={14} />
      </button>
    </div>
  );
}

function sessionTitle(session: SessionInfo | null): string {
  if (!session) return "";
  return session.title || session.id.slice(0, 24);
}
