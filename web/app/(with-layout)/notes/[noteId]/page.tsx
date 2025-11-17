"use client";

import { useParams } from "next/navigation";

import { NoteWorkspace } from "@/components/notes/note-workspace";

export default function NoteEditorPage() {
  const params = useParams();
  const noteId = params?.noteId as string | undefined;

  return (
    <>
      <NoteWorkspace noteId={noteId} />
    </>
  );
}
