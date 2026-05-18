import type { DiffLine, ImageInput, RuntimeEvent } from "@/lib/types";

export type MessageItem =
  | { id: string; type: "user"; userText: string; userImages?: ImageInput[] }
  | { id: string; type: "assistant-text"; text: string; isStreaming?: boolean }
  | { id: string; type: "thinking"; thinkingText: string; thinkingStreaming?: boolean }
  | { id: string; type: "tool"; toolId: string; toolLabel: string; toolStatus: "pending" | "done" | "error"; toolOutput?: string }
  | { id: string; type: "diff"; diffPath: string; diffLines: DiffLine[] }
  | { id: string; type: "system"; systemText: string };

interface MessageBuilderState {
  items: MessageItem[];
  thinkingText: string;
  assistantText: string;
  currentAssistantId: string | null;
  currentThinkingId: string | null;
  toolLabels: Map<string, string>;
  nextId: number;
}

export function buildMessageItems(events: RuntimeEvent[]): MessageItem[] {
  const state: MessageBuilderState = {
    items: [],
    thinkingText: "",
    assistantText: "",
    currentAssistantId: null,
    currentThinkingId: null,
    toolLabels: new Map(),
    nextId: 0,
  };

  for (const event of events) applyEvent(state, event);
  return state.items;
}

function applyEvent(state: MessageBuilderState, event: RuntimeEvent): void {
  switch (event.type) {
    case "user-message":
      pushUserMessage(state, event);
      return;
    case "message-start":
      startAssistantMessage(state);
      return;
    case "thinking-delta":
      appendThinking(state, event.delta);
      return;
    case "text-delta":
      appendAssistantText(state, event.delta);
      return;
    case "tool-run-start":
      startTool(state, event);
      return;
    case "tool-run-end":
      finishTool(state, event);
      return;
    case "file-edit":
      pushDiff(state, event);
      return;
    case "error":
      stopStreaming(state);
      pushSystemMessage(state, `Error: ${event.error}`);
      return;
    case "interrupted":
      stopStreaming(state);
      pushSystemMessage(state, "Interrupted.");
      return;
    case "undo-complete":
      pushSystemMessage(state, `Undo complete — reverted ${event.revertedFiles ?? 0} file(s).`);
      return;
    case "done":
      stopStreaming(state);
      return;
  }
}

function pushUserMessage(state: MessageBuilderState, event: Extract<RuntimeEvent, { type: "user-message" }>) {
  state.items.push({
    id: nextId(state, "user"),
    type: "user",
    userText: event.text,
    userImages: event.images,
  });
}

function startAssistantMessage(state: MessageBuilderState) {
  stopStreaming(state);
  state.assistantText = "";
}

function appendThinking(state: MessageBuilderState, delta: string) {
  if (!state.currentThinkingId) {
    state.currentThinkingId = nextId(state, "thinking");
    state.thinkingText = "";
    state.items.push({
      id: state.currentThinkingId,
      type: "thinking",
      thinkingText: "",
      thinkingStreaming: true,
    });
  }

  state.thinkingText += delta;
  updateItem(state, state.currentThinkingId, (item) => {
    if (item.type === "thinking") item.thinkingText = state.thinkingText;
  });
}

function appendAssistantText(state: MessageBuilderState, delta: string) {
  finalizeThinking(state);

  if (!state.currentAssistantId) {
    state.currentAssistantId = nextId(state, "asst");
    state.assistantText = "";
    state.items.push({
      id: state.currentAssistantId,
      type: "assistant-text",
      text: "",
      isStreaming: true,
    });
  }

  state.assistantText += delta;
  updateItem(state, state.currentAssistantId, (item) => {
    if (item.type === "assistant-text") item.text = state.assistantText;
  });
}

function startTool(state: MessageBuilderState, event: Extract<RuntimeEvent, { type: "tool-run-start" }>) {
  finalizeThinking(state);

  const label = event.label ? capitalize(event.label) : event.name ?? event.id;
  state.toolLabels.set(event.id, label);
  state.items.push({
    id: `tool-${event.id}`,
    type: "tool",
    toolId: event.id,
    toolLabel: label,
    toolStatus: "pending",
  });
}

function finishTool(state: MessageBuilderState, event: Extract<RuntimeEvent, { type: "tool-run-end" }>) {
  const tool = state.items.find((item): item is Extract<MessageItem, { type: "tool" }> => item.type === "tool" && item.toolId === event.id);

  if (tool) {
    tool.toolStatus = event.isError ? "error" : "done";
    tool.toolLabel = state.toolLabels.get(event.id) ?? tool.toolLabel;
    tool.toolOutput = event.text ?? "";
    return;
  }

  state.items.push({
    id: `tool-${event.id}`,
    type: "tool",
    toolId: event.id,
    toolLabel: event.name ?? event.id,
    toolStatus: event.isError ? "error" : "done",
    toolOutput: event.text ?? "",
  });
}

function pushDiff(state: MessageBuilderState, event: Extract<RuntimeEvent, { type: "file-edit" }>) {
  state.items.push({
    id: nextId(state, "diff"),
    type: "diff",
    diffPath: event.path,
    diffLines: event.lines ?? [],
  });
}

function pushSystemMessage(state: MessageBuilderState, text: string) {
  state.items.push({
    id: nextId(state, "sys"),
    type: "system",
    systemText: text,
  });
}

function stopStreaming(state: MessageBuilderState) {
  finalizeThinking(state);

  if (state.currentAssistantId) {
    updateItem(state, state.currentAssistantId, (item) => {
      if (item.type === "assistant-text") item.isStreaming = false;
    });
    state.currentAssistantId = null;
  }

  for (const item of state.items) {
    if (item.type === "thinking") item.thinkingStreaming = false;
    if (item.type === "assistant-text") item.isStreaming = false;
  }
}

function finalizeThinking(state: MessageBuilderState) {
  if (!state.currentThinkingId) return;

  updateItem(state, state.currentThinkingId, (item) => {
    if (item.type === "thinking") item.thinkingStreaming = false;
  });
  state.currentThinkingId = null;
  state.thinkingText = "";
}

function updateItem(state: MessageBuilderState, id: string, update: (item: MessageItem) => void) {
  const item = state.items.find((entry) => entry.id === id);
  if (item) update(item);
}

function nextId(state: MessageBuilderState, prefix: string): string {
  return `${prefix}-${state.nextId++}`;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
