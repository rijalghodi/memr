"use client";
import "./tiptap.css";
import { cn } from "@/lib/utils";
import { ImageExtension } from "@/components/tiptap/extensions/image";
import { ImagePlaceholder } from "@/components/tiptap/extensions/image-placeholder";
import SearchAndReplace from "@/components/tiptap/extensions/search-and-replace";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import { EditorContent, type Extension, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TipTapFloatingMenu } from "@/components/tiptap/extensions/floating-menu";
import { FloatingToolbar } from "@/components/tiptap/extensions/floating-toolbar";
import { EditorToolbar } from "./toolbars/editor-toolbar";
import Placeholder from "@tiptap/extension-placeholder";
import { content } from "@/lib/content";
import { FloatingMenuBasic } from "./extensions/floating-menu-basic";
import { extensions } from "./extensions/extensions";
import { useEffect } from "react";
import { Markdown } from "@tiptap/markdown";

type Props = {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
};

export function RichTextEditor({ value, onChange, className }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: extensions as Extension[],
    // contentType: "markdown",
    // content: "# Hello World\n\nThis is **Markdown**!",
    editorProps: {
      attributes: {
        class: "max-w-full focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      // do what you want to do with output
      // Update stats
      // saving as text/json/hmtml
      // const text = editor.getHTML();
      // const markdown = editor.getMarkdown();
      console.log(editor.getText());
    },
  });

  useEffect(() => {
    if (editor) {
      // editor.setMarkdown(value ?? "");
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div
      className={cn(
        "relative max-h-[calc(100dvh-6rem)]  w-full overflow-hidden overflow-y-scroll border bg-card pb-[60px] sm:pb-0",
        className
      )}
    >
      {/* <EditorToolbar editor={editor} /> */}
      <FloatingToolbar editor={editor} />
      <TipTapFloatingMenu editor={editor} />

      <EditorContent
        editor={editor}
        className=" min-h-[600px] w-full min-w-full cursor-text"
      />
    </div>
  );
}
