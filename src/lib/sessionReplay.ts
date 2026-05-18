import { formatToolLabel } from "@/lib/utils";
import type { RuntimeEvent, SessionContentPart, SessionEvent } from "@/lib/types";

export function buildReplayEvents(sessionEvents: SessionEvent[]): RuntimeEvent[] {
  const toolLabels = collectToolLabels(sessionEvents);
  const replayEvents: RuntimeEvent[] = [];

  for (const event of sessionEvents) {
    if (event.type === "session" || event.type === "model_change") continue;

    if (event.type === "interrupt") {
      replayEvents.push({ type: "interrupted" });
      continue;
    }

    if (event.type === "runtime_event" && event.event) {
      replayEvents.push(event.event);
      continue;
    }

    if (event.type !== "message" || !event.message) continue;

    if (event.message.role === "assistant") {
      replayEvents.push(...buildAssistantReplayEvents(event.message.content ?? []));
      continue;
    }

    if (event.message.role === "tool") {
      const id = event.message.toolCallId || event.message.toolName || crypto.randomUUID();
      replayEvents.push({
        type: "tool-run-start",
        id,
        name: event.message.toolName,
        label: event.message.toolCallId ? toolLabels.get(event.message.toolCallId) : undefined,
      });
      replayEvents.push({
        type: "tool-run-end",
        id,
        text: textContent(event.message.content ?? []),
        isError: Boolean(event.message.isError),
        name: event.message.toolName,
      });
    }
  }

  return replayEvents;
}

function collectToolLabels(sessionEvents: SessionEvent[]): Map<string, string> {
  const labels = new Map<string, string>();

  for (const event of sessionEvents) {
    if (event.type !== "message" || event.message?.role !== "assistant") continue;

    for (const part of event.message.content ?? []) {
      if (part.type === "tool-call") {
        labels.set(part.id, formatToolLabel(part.name, part.arguments ?? {}));
      }
    }
  }

  return labels;
}

function buildAssistantReplayEvents(content: SessionContentPart[]): RuntimeEvent[] {
  const thinking = content
    .filter((part): part is Extract<SessionContentPart, { type: "thinking" }> => part.type === "thinking")
    .map((part) => part.text)
    .join("\n");
  const text = textContent(content);
  const events: RuntimeEvent[] = [{ type: "message-start" }];

  if (thinking) events.push({ type: "thinking-delta", delta: thinking });
  if (text) events.push({ type: "text-delta", delta: text });

  events.push({ type: "done", runId: "" });
  return events;
}

function textContent(content: SessionContentPart[]): string {
  return content
    .filter((part): part is Extract<SessionContentPart, { type: "text" }> => part.type === "text")
    .map((part) => part.text)
    .join("\n");
}
