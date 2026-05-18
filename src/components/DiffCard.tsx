"use client";

import type { DiffLine } from "@/lib/types";

interface DiffCardProps {
  path: string;
  lines: DiffLine[];
}

/**
 * Displays a file edit diff card showing added/removed lines.
 */
export function DiffCard({ path, lines }: DiffCardProps) {
  const normalized = (Array.isArray(lines) ? lines : []).map((line) => {
    const tone = line?.tone;
    const type = line?.type;
    const kind =
      type === "added" || tone === "success"
        ? "added"
        : type === "removed" || tone === "danger"
          ? "removed"
          : "context";
    return { kind, text: String(line?.text ?? "") };
  });

  const added = normalized.filter((l) => l.kind === "added").length;
  const removed = normalized.filter((l) => l.kind === "removed").length;
  const MAX = 100;

  return (
    <div className="msg-row">
      <div className="border border-border rounded-xl overflow-hidden my-1.5 bg-white/[0.015]">
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-gradient-to-b from-white/[0.035] to-transparent">
          <div className="w-5 h-5 rounded-md flex items-center justify-center bg-accent/10 text-accent flex-shrink-0">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs text-text-muted">File edited</div>
            <div className="font-mono text-xs text-text overflow-hidden text-ellipsis whitespace-nowrap" title={path}>
              {path}
            </div>
          </div>
          <div className="flex gap-1.5 flex-shrink-0 font-mono text-[11px]">
            <span className="px-1.5 py-0.5 rounded-full border border-border text-tool-done bg-tool-done/10">
              +{added}
            </span>
            <span className="px-1.5 py-0.5 rounded-full border border-border text-danger bg-danger/10">
              -{removed}
            </span>
          </div>
        </div>

        {/* Diff body */}
        <div className="font-mono text-xs leading-relaxed max-h-[420px] overflow-auto">
          {normalized.slice(0, MAX).map((line, index) => {
            const sign =
              line.kind === "added"
                ? "+"
                : line.kind === "removed"
                  ? "-"
                  : " ";
            return (
              <div
                key={index}
                className={`grid grid-cols-[34px_1fr] gap-2.5 px-3 border-l-2 whitespace-pre-wrap break-words ${
                  line.kind === "added"
                    ? "bg-tool-done/10 border-l-tool-done text-[#b8e5c8]"
                    : line.kind === "removed"
                      ? "bg-danger/10 border-l-danger text-[#ebb2b2]"
                      : "text-text-muted"
                }`}
              >
                <span className="text-text-subtle select-none text-right">
                  {index + 1}
                </span>
                <span>{sign + line.text}</span>
              </div>
            );
          })}
          {normalized.length > MAX && (
            <div className="px-3 py-2 text-text-muted text-xs">
              … {normalized.length - MAX} more lines
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
