"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type {
  ServerMsg,
  ClientMsg,
  AppState,
  RuntimeEvent,
  SessionInfo,
  ModelInfo,
  UsageInfo,
  ImageInput,
  SessionEvent,
} from "@/lib/types";

/**
 * Custom hook for managing the WebSocket connection to the Atom runtime.
 *
 * Provides:
 * - Connection lifecycle (auto-reconnect)
 * - Message sending
 * - Reactive state: model, models, sessions, isRunning, usage
 * - Event feed: onEvent callback for streaming events
 */
export function useWebSocket(opts: {
  onEvent?: (event: RuntimeEvent) => void;
  onSessionLoaded?: (sessionId: string, events: SessionEvent[]) => void;
  onSessionDeleted?: (sessionId: string) => void;
  onError?: (message: string) => void;
}) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const { onEvent, onSessionLoaded, onSessionDeleted, onError } = opts;

  const [state, setState] = useState<AppState>({
    model: null,
    models: [],
    sessions: [],
    isRunning: false,
    usage: null,
    pendingImages: [],
    connected: false,
    events: [],
  });

  // ─── Connect ───────────────────────────────────────────────────────────

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${location.host}/ws`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[next-webui] WebSocket connected");
      setState((prev) => ({ ...prev, connected: true }));
    };

    ws.onclose = () => {
      console.log("[next-webui] WebSocket disconnected, reconnecting...");
      setState((prev) => ({ ...prev, connected: false }));
      reconnectTimerRef.current = setTimeout(connect, 1500);
    };

    ws.onerror = () => {
      // onclose will fire after this
    };

    ws.onmessage = (e: MessageEvent) => {
      try {
        const msg: ServerMsg = JSON.parse(e.data);
        handleMessage(msg);
      } catch (err) {
        console.error("[next-webui] failed to parse message:", err);
      }
    };
  }, []);

  // ─── Message handler ─────────────────────────────────────────────────

  const handleMessage = useCallback(
    (msg: ServerMsg) => {
      switch (msg.type) {
        case "ready":
          setState((prev) => ({
            ...prev,
            models: msg.models ?? [],
            sessions: msg.sessions ?? [],
            model: msg.model ?? null,
            isRunning: msg.isRunning ?? false,
            usage: msg.usage ?? null,
          }));
          break;

        case "run-start":
          setState((prev) => ({ ...prev, isRunning: true }));
          break;

        case "run-end":
          setState((prev) => ({
            ...prev,
            isRunning: false,
            usage: msg.usage ?? prev.usage,
            model: msg.model ?? prev.model,
            sessions: msg.sessions ?? prev.sessions,
          }));
          break;

        case "model-changed":
          setState((prev) => ({ ...prev, model: msg.model }));
          break;

        case "session-loaded":
          onSessionLoaded?.(msg.sessionId, msg.events);
          break;

        case "session-refreshed":
          onSessionLoaded?.(msg.sessionId, msg.events);
          break;

        case "session-deleted":
          setState((prev) => ({
            ...prev,
            sessions: msg.sessions ?? prev.sessions,
          }));
          onSessionDeleted?.(msg.sessionId);
          break;

        case "busy":
          onError?.("Already processing a request — please wait.");
          break;

        case "error":
          onError?.(msg.message);
          break;

        case "event":
          onEvent?.(msg.event);
          break;
      }
    },
    [onEvent, onSessionLoaded, onError],
  );

  // ─── Send ─────────────────────────────────────────────────────────────

  const send = useCallback((msg: ClientMsg) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  // ─── Actions ──────────────────────────────────────────────────────────

  const submit = useCallback(
    (text: string, images?: ImageInput[]) => {
      send({ type: "submit", text, images });
    },
    [send],
  );

  const interrupt = useCallback(() => {
    send({ type: "interrupt" });
  }, [send]);

  const switchModel = useCallback(
    (modelId: string) => {
      send({ type: "switch-model", modelId });
    },
    [send],
  );

  const loadSession = useCallback(
    (sessionId: string) => {
      send({ type: "load-session", sessionId });
    },
    [send],
  );

  const deleteSession = useCallback(
    (sessionId: string) => {
      send({ type: "delete-session", sessionId });
    },
    [send],
  );

  // ─── Lifecycle ────────────────────────────────────────────────────────

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimerRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return {
    ...state,
    send,
    submit,
    interrupt,
    switchModel,
    loadSession,
    deleteSession,
  };
}

export type WebSocketAPI = ReturnType<typeof useWebSocket>;
