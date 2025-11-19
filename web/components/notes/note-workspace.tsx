"use client";

import React, { useEffect, useRef, useState } from "react";
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

  const [content, setContent] = useState("");
  const isInitialLoadRef = useRef(true);

  const debouncedContent = useDebounce(content, AUTOSAVE_INTERVAL);

  // Load note content when it's available
  useEffect(() => {
    if (note?.content && isInitialLoadRef.current) {
      setContent(note.content);
      isInitialLoadRef.current = false;
    }
  }, [note?.content]);

  // Autosave debounced content
  useEffect(() => {
    // if (isLoading || !noteId || isInitialLoadRef.current) return;

    // // Don't save if content hasn't changed from the loaded note
    // if (debouncedContent === note?.content) return;

    console.log("debouncedContent", debouncedContent);
    noteApi.update({
      id: noteId,
      content: debouncedContent,
    });
  }, [debouncedContent, noteId, isLoading, note?.content]);

  if (isLoading && noteId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-h-[calc(100vh-100px)] overflow-y-auto">
      <div className="w-full">
        <RichTextEditor value={content} onChange={setContent} />
      </div>
    </div>
  );
}

// {/* <div className="pt-6 pb-0 w-full px-[120px]">
//   <input
//     type="text"
//     placeholder="Untitled"
//     {...form.register("title")}
//     className="w-fit tex-2xl p-2 md:text-3xl lg:text-5xl font-semibold focus:outline-none border-none focus:ring-0 focus:bg-accent rounded-lg"
//   />
// </div> */}
