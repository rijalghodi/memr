"use client";

import { Loader2 } from "lucide-react";

import { RichTextEditor } from "@/components/tiptap/rich-text-editor";
import { NOTE_TITLE_FALLBACK } from "@/lib/constant";
import { extractFirstLineFromContent } from "@/lib/string";
import { noteApi, useGetNote } from "@/service/local/api-note";

import { ScrollArea } from "../ui/scroll-area";
import { NoteCollectionPicker } from "./note-collection-picker";
import { NoteDetailEmpty } from "./note-detail-empty";

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
    <div className="space-y-3 pt-3 flex flex-col h-full">
      <div className="px-6">
        <NoteCollectionPicker
          noteId={noteId}
          collectionId={note.collectionId}
        />
      </div>
      <ScrollArea className="flex-1 min-h-0">
        <div className="transition-all duration-500 animate-in fade-in slide-in-from-bottom-3">
          <RichTextEditor value={note.content} onChange={handleContentChange} />
        </div>
      </ScrollArea>
    </div>
  );
}
