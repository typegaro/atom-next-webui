import type { TaskItem } from "@/lib/types";

interface TaskStripProps {
  tasks: TaskItem[];
}

export function TaskStrip({ tasks }: TaskStripProps) {
  if (tasks.length === 0) return null;

  return (
    <div className="max-w-[852px] mx-auto w-full mb-0">
      <div className="bg-[#0a0a0a] border border-border rounded-t-[28px] border-b-0 px-4 py-2">
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          {tasks.map((task) => (
            <TaskStripItem key={task.id ?? task.text} task={task} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TaskStripItem({ task }: { task: TaskItem }) {
  return (
    <div
      className={`text-xs text-text-muted truncate max-w-full ${task.done ? "opacity-55 line-through" : ""}`}
      title={task.text}
    >
      {task.done ? "✓" : "○"} {task.id ? `${task.id}. ` : ""}
      {task.text}
    </div>
  );
}
