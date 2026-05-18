// ─── WebSocket protocol types ──────────────────────────────────────────

export interface ImageInput {
  mimeType: string;
  data: string;
  previewUrl?: string;
}

export interface ModelInfo {
  id: string;
  [key: string]: unknown;
}

export interface SessionInfo {
  id: string;
  title?: string;
  [key: string]: unknown;
}

export interface UsageInfo {
  totalTokens?: number;
  [key: string]: unknown;
}

// Messages from server → client
export type ServerMsg =
  | { type: "ready"; model: string | null; sessions: SessionInfo[]; models: ModelInfo[]; usage?: UsageInfo; isRunning: boolean }
  | { type: "event"; event: RuntimeEvent }
  | { type: "run-start" }
  | { type: "run-end"; usage?: UsageInfo; model?: string; sessions?: SessionInfo[] }
  | { type: "model-changed"; model: string }
  | { type: "session-loaded"; sessionId: string; events: SessionEvent[] }
  | { type: "session-refreshed"; sessionId: string; events: SessionEvent[] }
  | { type: "session-deleted"; sessionId: string; sessions: SessionInfo[] }
  | { type: "busy" }
  | { type: "error"; message: string };

// Messages from client → server
export type ClientMsg =
  | { type: "submit"; text: string; images?: ImageInput[] }
  | { type: "interrupt" }
  | { type: "switch-model"; modelId: string }
  | { type: "load-session"; sessionId: string }
  | { type: "delete-session"; sessionId: string };

// ─── Runtime event types ────────────────────────────────────────────

export type RuntimeEvent =
  | { type: "message-start" }
  | { type: "thinking-delta"; delta: string }
  | { type: "text-delta"; delta: string }
  | { type: "tool-run-start"; id: string; label?: string; name?: string }
  | { type: "tool-run-end"; id: string; text?: string; isError?: boolean; name?: string }
  | { type: "file-edit"; path: string; repoRoot?: string; patch?: string; lines?: DiffLine[] }
  | { type: "task-update"; items?: TaskItem[]; doneCount?: number; total?: number }
  | { type: "undo-complete"; revertedFiles?: number }
  | { type: "session-refresh"; sessionId?: string }
  | { type: "error"; error: string; runId: string }
  | { type: "interrupted" }
  | { type: "done"; runId?: string }
  | { type: "user-message"; text: string; images?: ImageInput[] };

export interface DiffLine {
  tone?: string;
  type?: string;
  text?: string;
}

export interface TaskItem {
  id?: number;
  text: string;
  done: boolean;
}

// ─── Session history event types ────────────────────────────────────

export interface SessionEvent {
  type: string;
  event?: RuntimeEvent;
  turnId?: string;
  message?: {
    role: "user" | "assistant" | "tool";
    content?: SessionContentPart[];
    toolCallId?: string;
    toolName?: string;
    isError?: boolean;
  };
  cwd?: string;
  modelId?: string;
}

export type SessionContentPart =
  | { type: "text"; text: string }
  | { type: "image"; mimeType: string; data: string }
  | { type: "thinking"; text: string }
  | { type: "tool-call"; id: string; name: string; arguments: Record<string, unknown> };

// ─── Client state ──────────────────────────────────────────────────

export interface AppState {
  model: string | null;
  models: ModelInfo[];
  sessions: SessionInfo[];
  isRunning: boolean;
  usage: UsageInfo | null;
  pendingImages: ImageInput[];
  connected: boolean;
  events: RuntimeEvent[];
}
