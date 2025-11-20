"use client";
import "./tiptap.css";

import {
  type Editor,
  EditorContent,
  type Extension,
  useEditor,
} from "@tiptap/react";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

import { extensions } from "./extensions/extensions";
import { FloatingToolbar } from "./extensions/floating-toolbar";
import { SlashCommand } from "./extensions/slash-command";

export interface RichTextEditorRef {
  editor: Editor | null;
  getMarkdown: () => string;
}

export function RichTextEditor({
  className,
  value,
  onChange,
}: {
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  const lastValueRef = useRef<string>("");
  const isUpdatingFromExternalRef = useRef(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: extensions as Extension[],
    editorProps: {
      attributes: {
        class: "max-w-full focus:outline-none",
      },
    },
    contentType: "markdown",

    onUpdate: ({ editor }) => {
      // Only call onChange if the update is from user input, not from external value change
      if (!isUpdatingFromExternalRef.current) {
        const markdown = editor.getMarkdown();
        lastValueRef.current = markdown;
        onChange?.(markdown);
      }
    },
  });

  // Only update editor content when value changes externally (e.g., loading a note)
  useEffect(() => {
    if (!editor || !value) return;

    const currentMarkdown = editor.getMarkdown();
    // Only update if the value is different from what's currently in the editor
    // This prevents resetting the editor when user is typing
    if (value !== currentMarkdown && value !== lastValueRef.current) {
      isUpdatingFromExternalRef.current = true;
      editor.commands.setContent(value, { contentType: "markdown" });
      lastValueRef.current = value;
      // Reset flag after a short delay to allow the update to complete
      setTimeout(() => {
        isUpdatingFromExternalRef.current = false;
      }, 50);
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div
      className={cn(
        "relative max-h-[calc(100dvh-6rem)] w-full overflow-y-scroll bg-card pb-[60px] sm:pb-0",
        className,
      )}
    >
      <FloatingToolbar editor={editor} />
      <SlashCommand editor={editor} />
      <EditorContent
        editor={editor}
        className=" min-h-[600px] w-full min-w-full cursor-text"
      />
    </div>
  );
}
