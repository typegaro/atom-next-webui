"use client";

import type { TaskItem } from "@/lib/types";

interface TaskPanelProps {
  items: TaskItem[];
  doneCount: number;
  total: number;
}

/**
 * Footer panel showing current task progress.
 */
export function TaskPanel({ items, doneCount, total }: TaskPanelProps) {
  if (!items.length) return null;

  return (
    <div className="border-t border-border-soft px-[26px] py-2 bg-white/[0.012] flex-shrink-0">
      <div className="max-w-chat mx-auto flex items-start gap-3">
        <div className="text-text-muted text-xs font-semibold min-w-[72px]">
          Task {doneCount}/{total}
        </div>
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          {items.map((task) => (
            <div
              key={task.id}
              className={`text-xs text-text-muted truncate max-w-full py-[1px] ${
                task.done ? "opacity-55 line-through" : ""
              }`}
              title={task.text}
            >
              {task.done ? "✓" : "○"} {task.id ? `${task.id}. ` : ""}
              {task.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
