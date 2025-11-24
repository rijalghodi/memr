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
  value = "",
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
    // Ensure empty editor has a paragraph node for placeholder to work
    content: value || "",

    onCreate: ({ editor }) => {
      // When editor is created with empty content and markdown contentType,
      // TipTap might not create the default paragraph node until focus.
      // Ensure paragraph node exists so placeholder can render immediately.
      if (!value) {
        // Use requestAnimationFrame to ensure editor is fully initialized
        requestAnimationFrame(() => {
          const { state } = editor;
          const { doc, schema } = state;
          // Check if document structure is missing paragraph node
          // This happens when contentType is markdown and content is empty
          if (doc.childCount === 0) {
            // Temporarily disable onChange to avoid triggering it
            isUpdatingFromExternalRef.current = true;
            // Insert an empty paragraph node directly using a transaction
            // This ensures placeholder can attach without triggering onChange
            const { tr } = state;
            const paragraph = schema.nodes.paragraph.create();
            tr.replaceWith(0, 0, paragraph);
            editor.view.dispatch(tr);
            // Re-enable onChange after a brief delay
            setTimeout(() => {
              isUpdatingFromExternalRef.current = false;
            }, 0);
          }
        });
      }
    },

    onUpdate: ({ editor }) => {
      // Only call onChange if the update is from user input, not from external value change
      if (!isUpdatingFromExternalRef.current) {
        const markdown = editor.getMarkdown();
        lastValueRef.current = markdown;
        onChange?.(markdown);
      }
    },
  });

  // // Only update editor content when value changes externally (e.g., loading a note)
  useEffect(() => {
    if (!editor) return;

    const currentMarkdown = editor.getMarkdown();
    // Only update if the value is different from what's currently in the editor
    // This prevents resetting the editor when user is typing
    // Handle empty string case explicitly to ensure paragraph node exists
    const normalizedValue = value || "";
    const normalizedCurrent = currentMarkdown || "";

    if (
      normalizedValue !== normalizedCurrent &&
      normalizedValue !== lastValueRef.current
    ) {
      isUpdatingFromExternalRef.current = true;
      editor.commands.setContent(normalizedValue, { contentType: "markdown" });
      lastValueRef.current = normalizedValue;
      // Reset flag after a short delay to allow the update to complete
      setTimeout(() => {
        isUpdatingFromExternalRef.current = false;
      }, 50);
    }
  }, [value, editor]);

  console.log("rich text editor value", value);

  if (!editor) return null;

  return (
    <div className={cn("relative h-full w-full pb-[60px]", className)}>
      <EditorContent
        editor={editor}
        className=" min-h-[600px] w-full min-w-full cursor-text"
      />
      <FloatingToolbar editor={editor} />
      <SlashCommand editor={editor} />
    </div>
  );
}
