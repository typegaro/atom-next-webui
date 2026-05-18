"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { markdownComponents } from "@/lib/markdown";

interface AssistantMessageProps {
  content: string;
  isStreaming?: boolean;
}

/**
 * Renders the assistant's text response with full Markdown support.
 * Uses react-markdown with GFM plugins and custom themed components.
 */
export function AssistantMessage({ content, isStreaming }: AssistantMessageProps) {
  if (!content && !isStreaming) return null;

  return (
    <div className="msg-row">
      <div
        className={`text-[15px] leading-relaxed text-text break-words py-1.5 ${isStreaming ? "streaming" : ""}`}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={markdownComponents}
        >
          {content || ""}
        </ReactMarkdown>

      </div>
    </div>
  );
}
