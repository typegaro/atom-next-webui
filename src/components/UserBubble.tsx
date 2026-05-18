"use client";

import type { ImageInput } from "@/lib/types";

interface UserBubbleProps {
  text: string;
  images?: ImageInput[];
}

/**
 * Renders a user message bubble with optional attached images.
 */
export function UserBubble({ text, images }: UserBubbleProps) {
  return (
    <div className="flex justify-end pt-2.5 pb-1 pr-2">
      <div className="bg-surface-panel border border-border rounded-2xl px-4 py-2.5 max-w-[74%] text-sm break-words">
        {text && <div>{text}</div>}
        {images && images.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {images.map((img, i) => (
              <img
                key={i}
                src={img.previewUrl ?? `data:${img.mimeType};base64,${img.data}`}
                alt=""
                className="max-w-[200px] max-h-[200px] rounded-lg object-cover"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
