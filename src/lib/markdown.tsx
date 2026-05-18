/**
 * Markdown rendering configuration using react-markdown.
 * This module provides the components and plugins for rendering
 * assistant messages with full Markdown support, syntax highlighting,
 * and GFM (tables, checkboxes, etc.).
 *
 * Every standard Markdown HTML element is styled here with Tailwind
 * classes matching the Atom dark theme.
 */
import type { Components } from "react-markdown";

/**
 * Custom components for react-markdown to match the Atom dark theme.
 * Covers all standard block-level and inline-level Markdown elements.
 */
export const markdownComponents: Partial<Components> = {
  // ── Block: Paragraph ──────────────────────────────────────────────

  p({ children, ...props }: any) {
    return (
      <p className="my-2 last:mb-0" {...props}>
        {children}
      </p>
    );
  },

  // ── Block: Headings ───────────────────────────────────────────────

  h1({ children, ...props }: any) {
    return (
      <h1 className="text-xl font-semibold mt-5 mb-2 text-white" {...props}>
        {children}
      </h1>
    );
  },
  h2({ children, ...props }: any) {
    return (
      <h2 className="text-lg font-semibold mt-4 mb-1.5 text-white" {...props}>
        {children}
      </h2>
    );
  },
  h3({ children, ...props }: any) {
    return (
      <h3 className="text-[17px] font-medium mt-3 mb-1 text-white" {...props}>
        {children}
      </h3>
    );
  },
  h4({ children, ...props }: any) {
    return (
      <h4 className="text-[15px] font-medium mt-2 mb-1 text-white" {...props}>
        {children}
      </h4>
    );
  },
  h5({ children, ...props }: any) {
    return (
      <h5 className="text-[14px] font-medium mt-2 mb-0.5 text-text-muted" {...props}>
        {children}
      </h5>
    );
  },
  h6({ children, ...props }: any) {
    return (
      <h6 className="text-[13px] font-medium mt-2 mb-0.5 text-text-muted" {...props}>
        {children}
      </h6>
    );
  },

  // ── Block: Lists ──────────────────────────────────────────────────

  ul({ children, ...props }: any) {
    return (
      <ul className="list-disc list-inside my-2 space-y-0.5" {...props}>
        {children}
      </ul>
    );
  },
  ol({ children, ...props }: any) {
    return (
      <ol className="list-decimal list-inside my-2 space-y-0.5" {...props}>
        {children}
      </ol>
    );
  },
  li({ children, ...props }: any) {
    return (
      <li className="text-text" {...props}>
        {children}
      </li>
    );
  },

  // ── Block: Code blocks ────────────────────────────────────────────

  code({ className, children, ...props }: any) {
    const isInline = !className;
    const code = String(children).replace(/\n$/, "");

    if (isInline) {
      return (
        <code
          className="bg-code-bg border border-border rounded px-[0.32em] py-[0.1em] text-[0.85em] font-mono"
          {...props}
        >
          {children}
        </code>
      );
    }

    return (
      <pre className="bg-code-bg border border-border rounded-lg p-4 overflow-x-auto my-3">
        <code className={`${className ?? ""} text-[0.85em] font-mono`} {...props}>
          {code}
        </code>
      </pre>
    );
  },

  // ── Block: Blockquotes ────────────────────────────────────────────

  blockquote({ children, ...props }: any) {
    return (
      <blockquote
        className="border-l-3 border-border pl-4 my-2 text-text-muted"
        {...props}
      >
        {children}
      </blockquote>
    );
  },

  // ── Block: Horizontal rules ────────────────────────────────────────

  hr(props: any) {
    return <hr className="border-t border-border my-4" {...props} />;
  },

  // ── Block: Tables ──────────────────────────────────────────────────

  table({ children, ...props }: any) {
    return (
      <table className="border-collapse w-full my-2 text-[0.9em]" {...props}>
        {children}
      </table>
    );
  },
  thead({ children, ...props }: any) {
    return <thead {...props}>{children}</thead>;
  },
  tbody({ children, ...props }: any) {
    return <tbody {...props}>{children}</tbody>;
  },
  tr({ children, ...props }: any) {
    return <tr className="even:bg-surface-panel/30" {...props}>{children}</tr>;
  },
  th({ children, ...props }: any) {
    return (
      <th
        className="border border-border px-3 py-1.5 text-left bg-surface-panel"
        {...props}
      >
        {children}
      </th>
    );
  },
  td({ children, ...props }: any) {
    return (
      <td className="border border-border px-3 py-1.5 text-left" {...props}>
        {children}
      </td>
    );
  },

  // ── Inline: Links ──────────────────────────────────────────────────

  a({ children, href, ...props }: any) {
    return (
      <a
        href={href}
        className="text-accent no-underline hover:underline"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    );
  },

  // ── Inline: Bold / Italic ──────────────────────────────────────────

  strong({ children, ...props }: any) {
    return (
      <strong className="text-white" {...props}>
        {children}
      </strong>
    );
  },
  em({ children, ...props }: any) {
    return (
      <em className="italic text-text" {...props}>
        {children}
      </em>
    );
  },

  // ── Inline: Strikethrough (GFM) ───────────────────────────────────

  del({ children, ...props }: any) {
    return (
      <del className="line-through text-text-muted" {...props}>
        {children}
      </del>
    );
  },

  // ── Inline: GFM Task-list checkbox ────────────────────────────────

  input({ ...props }: any) {
    // Only style checkbox inputs (task lists); pass everything else through
    if (props.type === "checkbox") {
      return (
        <input
          type="checkbox"
          className="accent-accent mr-1.5 -mt-0.5 inline-block align-middle"
          {...props}
        />
      );
    }
    return <input {...props} />;
  },
};


