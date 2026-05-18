"use client";

import { useState } from "react";

interface ThinkingBlockProps {
  text: string;
  isStreaming?: boolean;
}

/**
 * Collapsible block showing the assistant's chain-of-thought reasoning.
 */
export function ThinkingBlock({ text, isStreaming }: ThinkingBlockProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="msg-row">
      <div className={`collapsible ${open ? "open" : ""}`}>
        <button
          className="flex items-center gap-1.5 py-1 text-sm font-medium cursor-pointer text-thinking select-none w-full text-left"
          onClick={() => setOpen(!open)}
        >
          <span
            className={`text-[9px] opacity-36 transition-transform duration-150 ${open ? "rotate-90" : ""}`}
          >
            ▶
          </span>
          {isStreaming && (
            <span className="w-2.5 h-2.5 border-[1.5px] border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />
          )}
          <span>Thinking</span>
        </button>
        <div
          className={`${open ? "block" : "hidden"} pl-[18px] font-mono text-xs leading-relaxed text-thinking opacity-80 whitespace-pre-wrap break-words max-h-[380px] overflow-y-auto`}
        >
          {text}
        </div>
      </div>
    </div>
  );
}
