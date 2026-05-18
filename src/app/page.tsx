"use client";

import { useState, useCallback, useRef } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Sidebar } from "@/components/Sidebar";
import { MessageList } from "@/components/MessageList";
import { StatusBar } from "@/components/StatusBar";
import { InputArea } from "@/components/InputArea";
import { ModelPicker } from "@/components/ModelPicker";
import { buildReplayEvents } from "@/lib/sessionReplay";
import type { RuntimeEvent, TaskItem, ImageInput, SessionEvent } from "@/lib/types";

/**
 * Main chat page for the Atom Next WebUI.
 *
 * Orchestrates all components and manages the event stream state.
 */
export default function HomePage() {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [modelPickerOpen, setModelPickerOpen] = useState(false);

  // Event stream
  const [events, setEvents] = useState<RuntimeEvent[]>([]);

  // Task panel state
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [taskDoneCount, setTaskDoneCount] = useState(0);
  const [taskTotal, setTaskTotal] = useState(0);

  // Track if we have any visible content
  const [hasContent, setHasContent] = useState(false);

  // Handle runtime events
  const handleEvent = useCallback((event: RuntimeEvent) => {
    setEvents((prev) => [...prev, event]);

    // Track task updates
    if (event.type === "task-update" && event.items) {
      setTasks(event.items);
      setTaskDoneCount(event.doneCount ?? 0);
      setTaskTotal(event.total ?? event.items.length);
    }

    // Track content presence
    if (
      event.type !== "done" &&
      event.type !== "interrupted" &&
      event.type !== "undo-complete"
    ) {
      setHasContent(true);
    }
  }, []);

  // Track the currently loaded session ID
  const activeSessionRef = useRef<string | null>(null);

  // Handle session loaded
  const handleSessionLoaded = useCallback(
    (sessionId: string, sessionEvents: SessionEvent[]) => {
      activeSessionRef.current = sessionId;
      setEvents(buildReplayEvents(sessionEvents));
      setTasks([]);
      setHasContent(true);
    },
    [],
  );

  // Handle errors
  const handleError = useCallback((message: string) => {
    setEvents((prev) => [
      ...prev,
      {
        type: "error" as const,
        error: message,
        runId: "",
      },
    ]);
  }, []);

  // Handle session deleted — reset to new chat if it was the active one
  const handleSessionDeleted = useCallback((sessionId: string) => {
    if (activeSessionRef.current === sessionId) {
      setEvents([]);
      setTasks([]);
      setHasContent(false);
      activeSessionRef.current = null;
    }
  }, []);

  // WebSocket hook
  const ws = useWebSocket({
    onEvent: handleEvent,
    onSessionLoaded: handleSessionLoaded,
    onSessionDeleted: handleSessionDeleted,
    onError: handleError,
  });

  // New chat
  const handleNewChat = useCallback(() => {
    setEvents([]);
    setTasks([]);
    setHasContent(false);
  }, []);

  // Send a message — add a user-message event locally, then forward to WS
  const handleSend = useCallback(
    (text: string, images?: ImageInput[]) => {
      setEvents((prev) => [
        ...prev,
        { type: "user-message" as const, text, images },
      ]);
      setHasContent(true);
      ws.submit(text, images);
    },
    [ws.submit],
  );

  return (
    <>
      {/* Sidebar */}
      <Sidebar
        visible={sidebarVisible}
        sessions={ws.sessions}
        onNewChat={handleNewChat}
        onLoadSession={ws.loadSession}
        onDeleteSession={ws.deleteSession}
        onToggle={() => setSidebarVisible(!sidebarVisible)}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Messages */}
        {hasContent ? (
          <MessageList events={events} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <h1 className="text-2xl font-normal tracking-tight text-text">
              Where should we begin?
            </h1>
          </div>
        )}

        {/* Input area (with integrated task panel) */}
        <InputArea
          isRunning={ws.isRunning}
          model={ws.model}
          onSend={handleSend}
          onInterrupt={ws.interrupt}
          onOpenModelPicker={() => setModelPickerOpen(true)}
          tasks={tasks}
          taskDoneCount={taskDoneCount}
          taskTotal={taskTotal}
        />

        {/* Status bar */}
        <StatusBar
          model={ws.model}
          isRunning={ws.isRunning}
          totalTokens={ws.usage?.totalTokens}
          onToggleSidebar={
            !sidebarVisible
              ? () => setSidebarVisible(true)
              : undefined
          }
        />
      </div>

      {/* Model picker overlay */}
      <ModelPicker
        open={modelPickerOpen}
        models={ws.models}
        activeModel={ws.model}
        onSelect={ws.switchModel}
        onClose={() => setModelPickerOpen(false)}
      />
    </>
  );
}
