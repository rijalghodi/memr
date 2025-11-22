"use client";

import { Loader2 } from "lucide-react";

import { RichTextEditor } from "@/components/tiptap/rich-text-editor";
import { NOTE_TITLE_FALLBACK } from "@/lib/constant";
import { extractFirstLineFromContent } from "@/lib/string";
import { noteApi, useGetNote } from "@/service/local/api-note";

import { NoteDetailEmpty } from "./note-detail-empty";
import { SelectCollection } from "./select-collection";

type Props = {
  noteId: string;
};

export function NoteWorkspace({ noteId }: Props) {
  const { data: note, isLoading } = useGetNote(noteId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="size-4 animate-spin text-primary" />
      </div>
    );
  }

  const handleContentChange = (content: string) => {
    noteApi.update({
      id: noteId,
      content,
    });
    document.title =
      extractFirstLineFromContent(content, 30) || NOTE_TITLE_FALLBACK;
  };

  if (!note) return <NoteDetailEmpty />;

  return (
    <div className="space-y-3 pt-3 max-h-[calc(100vh-100px)] overflow-y-auto">
      <div className="px-6">
        <SelectCollection noteId={noteId} collectionId={note.collectionId} />
      </div>

      <div className="w-full transition-all duration-500 animate-in fade-in slide-in-from-bottom-3">
        <RichTextEditor value={note.content} onChange={handleContentChange} />
      </div>
    </div>
  );
}
