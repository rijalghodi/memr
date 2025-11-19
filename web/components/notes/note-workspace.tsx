"use client";

import React, { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";

import { useDebounce } from "@/hooks/use-debounce";
import { AUTOSAVE_INTERVAL } from "@/lib/constant";
import { noteApi, useGetNote } from "@/service/local/api-note";

import {
  RichTextEditor,
  RichTextEditorRef,
} from "@/components/tiptap/rich-text-editor";

type Props = {
  noteId: string;
};

export function NoteWorkspace({ noteId }: Props) {
  const { data: note, isLoading } = useGetNote(noteId);

  const editorRef = useRef<RichTextEditorRef>(null);

  const parseMarkdown = (markdown: string) => {
    const editor = editorRef.current?.editor;
    if (!editor || !editor.markdown) {
      console.error("Editor or MarkdownManager not available");
      return;
    }

    try {
      editor.commands.setContent(markdown, true, { contentType: "markdown" });
    } catch (err) {
      console.error(err);
    }
  };

  const getEditorAsMarkdown = () => {
    const editor = editorRef.current?.editor;
    if (!editor) {
      return "";
    }

    try {
      return editor.getMarkdown();
    } catch {
      return editor.getText();
    }
  };

  const form = useForm({
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const values = useDebounce(
    {
      title: form.watch("title"),
      content: form.watch("content"),
    },
    AUTOSAVE_INTERVAL
  );

  useEffect(() => {
    form.reset({
      title: note?.title ?? "",
      content: note?.content ?? "",
    });
  }, [note]);

  useEffect(() => {
    console.log("debounced update values", values);
    if (!isLoading && noteId) {
      noteApi.update({
        id: noteId,
        title: values.title,
        content: values.content,
      });
    }
  }, [JSON.stringify(values)]);

  if (isLoading && noteId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-h-[calc(100vh-100px)] overflow-y-auto">
      {/* <div className="pt-6 pb-0 w-full px-[120px]">
        <input
          type="text"
          placeholder="Untitled"
          {...form.register("title")}
          className="w-fit tex-2xl p-2 md:text-3xl lg:text-5xl font-semibold focus:outline-none border-none focus:ring-0 focus:bg-accent rounded-lg"
        />
      </div> */}
      <div className="w-full">
        <RichTextEditor ref={editorRef} />
        {/* <RichTextEditor
          value={form.watch("content")}
          onChange={(value) => form.setValue("content", value)}
        /> */}
      </div>
    </div>
  );
}
