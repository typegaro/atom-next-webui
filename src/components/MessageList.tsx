"use client";

import { useEffect, useRef, useCallback } from "react";
import { UserBubble } from "./UserBubble";
import { AssistantMessage } from "./AssistantMessage";
import { ThinkingBlock } from "./ThinkingBlock";
import { ToolBlock } from "./ToolBlock";
import { DiffCard } from "./DiffCard";
import { EmptyState } from "./EmptyState";
import type { RuntimeEvent } from "@/lib/types";
import { buildMessageItems, type MessageItem } from "@/lib/messageItems";

interface MessageListProps {
  events: RuntimeEvent[];
}

/**
 * MessageList renders runtime events as chat bubbles, tool cards, diffs, and system notices.
 */
export function MessageList({ events }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const items = buildMessageItems(events);

  const scrollBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    });
  }, []);

  useEffect(() => {
    scrollBottom();
  }, [events, scrollBottom]);

  if (items.length === 0) return <EmptyState />;

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto pt-8 pb-3 flex flex-col gap-0.5"
    >
      {items.map((item) => (
        <MessageListItem key={item.id} item={item} />
      ))}
    </div>
  );
}

function MessageListItem({ item }: { item: MessageItem }) {
  switch (item.type) {
    case "user":
      return <UserBubble text={item.userText} images={item.userImages} />;
    case "assistant-text":
      return <AssistantMessage content={item.text} isStreaming={item.isStreaming} />;
    case "thinking":
      return <ThinkingBlock text={item.thinkingText} isStreaming={item.thinkingStreaming} />;
    case "tool":
      return (
        <ToolBlock
          id={item.toolId}
          label={item.toolLabel}
          status={item.toolStatus}
          output={item.toolOutput}
        />
      );
    case "diff":
      return <DiffCard path={item.diffPath} lines={item.diffLines} />;
    case "system":
      return <SystemMessage text={item.systemText} />;
  }
}

function SystemMessage({ text }: { text: string }) {
  return (
    <div className="text-center text-xs text-text-subtle px-7 py-1.5">
      {text}
    </div>
  );
}
