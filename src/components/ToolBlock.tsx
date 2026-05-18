"use client";

import { useState } from "react";
import { compactToolText } from "@/lib/utils";

interface ToolBlockProps {
  id: string;
  label: string;
  status: "pending" | "done" | "error";
  output?: string;
}

/**
 * Collapsible block showing a tool call, its status, and output preview.
 */
export function ToolBlock({ label, status, output }: ToolBlockProps) {
  const [open, setOpen] = useState(false);
  const preview = output ? compactToolText(output) : "";

  const statusColors: Record<string, string> = {
    pending: "text-tool-pending",
    done: "text-text-muted",
    error: "text-danger",
  };

  return (
    <div className="msg-row">
      <div className={`collapsible ${open ? "open" : ""}`}>
        <button
          className={`flex items-center gap-1.5 py-1 text-sm font-medium cursor-pointer select-none w-full text-left ${statusColors[status] ?? "text-text-muted"}`}
          onClick={() => setOpen(!open)}
        >
          <span
            className={`text-[9px] opacity-36 transition-transform duration-150 ${open ? "rotate-90" : ""}`}
          >
            ▶
          </span>
          {status === "pending" && (
            <span className="w-2.5 h-2.5 border-[1.5px] border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />
          )}
          <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex-1 text-left">
            {label}
          </span>
          <span className="flex-shrink-0 opacity-75">
            {status === "error" ? "[error]" : status === "done" ? "done" : ""}
          </span>
        </button>
        {preview && (
          <div
            className={`${open ? "block" : "hidden"} font-mono text-xs leading-relaxed text-text-muted opacity-75 whitespace-pre-wrap break-words max-h-[220px] overflow-y-auto`}
          >
            {preview}
          </div>
        )}
      </div>
    </div>
  );
}
