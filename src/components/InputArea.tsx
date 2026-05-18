"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { abbreviateModel } from "@/lib/utils";
import type { ImageInput, TaskItem } from "@/lib/types";
import { ImagePreviewStrip } from "./ImagePreviewStrip";
import { TaskStrip } from "./TaskStrip";
import { Icon } from "./ui/Icon";
import { IconButton } from "./ui/IconButton";

interface InputAreaProps {
  isRunning: boolean;
  model: string | null;
  onSend: (text: string, images?: ImageInput[]) => void;
  onInterrupt: () => void;
  onOpenModelPicker: () => void;
  tasks?: TaskItem[];
  taskDoneCount?: number;
  taskTotal?: number;
}

/**
 * Chat input area with textarea, image attachment, model selector, and send button.
 * Supports drag-and-drop, paste, and file picker for images.
 */
export function InputArea({
  isRunning,
  model,
  onSend,
  onInterrupt,
  onOpenModelPicker,
  tasks = [],
}: InputAreaProps) {
  const [text, setText] = useState("");
  const [images, setImages] = useState<ImageInput[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasTasks = tasks.length > 0;

  const autosize = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.max(textarea.scrollHeight, 64)}px`;
  }, []);

  const addImage = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setImages((prev) => [
        ...prev,
        {
          mimeType: file.type,
          data: url.split(",")[1],
          previewUrl: url,
        },
      ]);
    };
    reader.readAsDataURL(file);
  }, []);

  const submit = useCallback(() => {
    if (isRunning) {
      onInterrupt();
      return;
    }

    const trimmed = text.trim();
    if (!trimmed && images.length === 0) return;

    onSend(trimmed, images);
    setText("");
    setImages([]);
    autosize();
  }, [autosize, images, isRunning, onInterrupt, onSend, text]);

  const attachFiles = useCallback((files: FileList | File[]) => {
    Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .forEach(addImage);
  }, [addImage]);

  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <div
      className="flex-shrink-0 px-4 sm:px-6 pb-4 sm:pb-5 pt-2"
      onDragOver={(event) => {
        event.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={(event) => {
        if (!event.relatedTarget) setDragOver(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragOver(false);
        attachFiles(event.dataTransfer?.files || []);
      }}
    >
      <ImagePreviewStrip images={images} onRemove={removeImage} />
      <TaskStrip tasks={tasks} />

      <div
        className={`bg-surface-panel border rounded-[28px] grid grid-cols-[32px_minmax(0,1fr)_34px] sm:grid-cols-[32px_minmax(0,1fr)_auto_auto_34px] gap-2.5 p-3 transition-colors max-w-[852px] mx-auto ${
          hasTasks ? "rounded-t-none border-t-0" : ""
        } ${dragOver ? "border-accent bg-accent/5" : "border-border"}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            attachFiles(event.target.files || []);
            event.target.value = "";
          }}
        />

        <MobileModelButton model={model} onClick={onOpenModelPicker} />

        <IconButton
          className="self-end w-8 h-[34px] flex items-center justify-center col-start-1 col-end-2"
          title="Attach image"
          onClick={() => fileInputRef.current?.click()}
        >
          <Icon name="plus" size={17} />
        </IconButton>

        <textarea
          ref={textareaRef}
          className="bg-transparent border-none outline-none text-text font-inherit text-[15px] resize-none min-h-[64px] max-h-[180px] overflow-y-auto leading-relaxed px-0 pb-0.5 self-stretch col-start-2 col-end-3"
          placeholder="Ask anything"
          rows={1}
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            autosize();
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
          onPaste={(event) => {
            const imageItems = Array.from(event.clipboardData?.items || []).filter((item) => item.type.startsWith("image/"));
            if (!imageItems.length) return;
            event.preventDefault();
            imageItems.forEach((item) => {
              const file = item.getAsFile();
              if (file) addImage(file);
            });
          }}
        />

        <div className="hidden sm:flex self-end items-center text-text-muted text-xs whitespace-nowrap min-h-[34px] col-start-3 col-end-4" />

        <DesktopModelButton model={model} onClick={onOpenModelPicker} />

        <button
          type="button"
          className={`self-end w-[34px] h-[34px] rounded-full border-none cursor-pointer flex items-center justify-center flex-shrink-0 p-0 leading-none transition-all ${
            isRunning
              ? "bg-transparent border-[1.5px] border-danger text-danger"
              : "bg-text text-surface"
          } col-start-3 sm:col-start-5 col-end-4 sm:col-end-6`}
          title={isRunning ? "Stop" : "Send"}
          onClick={submit}
        >
          <Icon name={isRunning ? "stop" : "send"} size={isRunning ? 12 : 14} />
        </button>
      </div>
    </div>
  );
}

function MobileModelButton({ model, onClick }: { model: string | null; onClick: () => void }) {
  return (
    <button
      type="button"
      className="col-span-3 sm:hidden justify-self-start bg-transparent border-none cursor-pointer text-text-muted text-sm font-inherit px-2 py-1 rounded-lg whitespace-nowrap flex items-center justify-center transition-colors hover:bg-surface-hover hover:text-text"
      onClick={onClick}
      title="Change model"
    >
      {abbreviateModel(model)}
    </button>
  );
}

function DesktopModelButton({ model, onClick }: { model: string | null; onClick: () => void }) {
  return (
    <button
      type="button"
      className="self-end bg-none border-none cursor-pointer text-text-muted text-base font-inherit px-1 min-h-[34px] rounded-lg whitespace-nowrap flex-shrink-0 items-center justify-center transition-colors hover:bg-surface-hover hover:text-text col-start-4 col-end-5 hidden sm:flex"
      onClick={onClick}
    >
      {abbreviateModel(model)}
    </button>
  );
}
