"use client";

import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { useDebounce } from "@/hooks/use-debounce";
import { AUTOSAVE_INTERVAL, NOTE_TITLE_FALLBACK } from "@/lib/constant";
import { ROUTES } from "@/lib/routes";
import { noteApi, useGetNote } from "@/service/local/api-note";

import { useSessionTabs } from "@/components/session-tabs";
import {
  RichTextEditor,
  RichTextEditorRef,
} from "@/components/tiptap/rich-text-editor";
import { Loader2 } from "lucide-react";

type Props = {
  noteId: string;
};

export function NoteWorkspace({ noteId }: Props) {
  const { data: note, isLoading } = useGetNote(noteId);
  const { updateTabTitle } = useSessionTabs();

  const [content, setContent] = useState("");
  const contentLoaded = useRef(false);

  const debouncedContent = useDebounce(content, AUTOSAVE_INTERVAL);

  // Load note content when it's available (only once per note)
  useEffect(() => {
    if (!isLoading && note && !contentLoaded.current) {
      setContent(note.content || "");
      contentLoaded.current = true;
    }
  }, [note, isLoading]);

  // Update tab title when note or content changes
  useEffect(() => {
    if (!contentLoaded.current || !noteId) return;

    const title = note?.title || NOTE_TITLE_FALLBACK;

    updateTabTitle(ROUTES.NOTE(noteId), title);
  }, [content, noteId, updateTabTitle, contentLoaded]);

  // Autosave debounced content
  useEffect(() => {
    if (!contentLoaded.current || !noteId) return;

    // Don't save if content hasn't changed from the loaded note
    if (debouncedContent === note?.content) return;

    noteApi.update({
      id: noteId,
      content: debouncedContent,
    });
  }, [debouncedContent, noteId, note?.content]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="size-4 animate-spin text-primary" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">Note not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-h-[calc(100vh-100px)] overflow-y-auto">
      <div
        className="w-full transition-all duration-500 ease-in-out animate-in fade-in slide-in-from-bottom-3"
        key={noteId}
      >
        <RichTextEditor value={content} onChange={setContent} />
      </div>
    </div>
  );
}
