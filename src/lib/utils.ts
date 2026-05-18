/**
 * Utility helpers for the Atom Next WebUI.
 */

/**
 * Escape HTML entities in a string.
 */
export function esc(text: unknown): string {
  const d = document.createElement("div");
  d.textContent = String(text);
  return d.innerHTML;
}

/**
 * Abbreviate a model ID for display.
 */
export function abbreviateModel(id: string | null): string {
  if (!id) return "—";
  return id
    .replace(/^(anthropic|claude)\//i, "")
    .replace(/-\d{8}$/, "")
    .split(":")[0];
}

/**
 * Format a tool call label for display.
 */
export function formatToolLabel(
  name: string,
  args: Record<string, unknown>,
): string {
  const label = name.charAt(0).toUpperCase() + name.slice(1);
  let detail = "";

  if (name === "bash" && typeof args.command === "string") {
    detail = args.command;
  } else if (
    ["read", "edit", "write"].includes(name) &&
    typeof args.filePath === "string"
  ) {
    detail = args.filePath;
  } else if (Object.keys(args).length > 0) {
    detail = JSON.stringify(args);
  }

  if (detail.length > 80) detail = detail.slice(0, 77) + "…";
  return detail ? `${label}: ${detail}` : label;
}

/**
 * Compact tool output text for preview.
 */
export function compactToolText(text: string): string {
  const clean = String(text).trim();
  if (!clean) return "";
  const lines = clean.split(/\r?\n/);
  const maxLines = 8;
  const maxChars = 1200;
  let out = lines.slice(0, maxLines).join("\n");
  if (out.length > maxChars) out = out.slice(0, maxChars).trimEnd();
  if (lines.length > maxLines || clean.length > out.length) {
    out += `\n… ${lines.length > maxLines ? `${lines.length - maxLines} more line(s)` : "truncated"}`;
  }
  return out;
}

/**
 * Format token count for display.
 */
export function formatTokens(count: number): string {
  return count.toLocaleString() + " tokens";
}
