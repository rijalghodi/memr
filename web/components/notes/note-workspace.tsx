"use client";

import { Loader2 } from "lucide-react";

import { RichTextEditor } from "@/components/tiptap/rich-text-editor";
import { useGetNote } from "@/service/local/api-note";

import { NoteDetailEmpty } from "./note-detail-empty";
import { SelectCollection } from "./select-collection";
import { useNoteContent } from "./use-note-content";

type Props = {
  noteId: string;
};

export function NoteWorkspace({ noteId }: Props) {
  const { data: note, isLoading } = useGetNote(noteId);

  // const { content, setContent } = useNoteContent(note, noteId, isLoading);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="size-4 animate-spin text-primary" />
      </div>
    );
  }

  if (!note) return <NoteDetailEmpty />;

  return (
    <div className="space-y-3 pt-3 max-h-[calc(100vh-100px)] overflow-y-auto">
      <div className="px-6">
        <SelectCollection noteId={noteId} collectionId={note.collectionId} />
      </div>

      <div className="w-full transition-all duration-500 animate-in fade-in slide-in-from-bottom-3">
        <RichTextEditor value={note.content} />
      </div>
    </div>
  );
}
