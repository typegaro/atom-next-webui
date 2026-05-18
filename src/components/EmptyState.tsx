"use client";

/**
 * Empty state shown when there are no messages yet.
 */
export function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <h1 className="text-2xl font-normal tracking-tight text-text">
        Where should we begin?
      </h1>
    </div>
  );
}
