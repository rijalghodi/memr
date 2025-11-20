import { useParams } from "react-router-dom";

import { NoteWorkspace } from "@/components/notes/note-workspace";

export function NoteEditorPage() {
  const params = useParams();
  const noteId = params.noteId as string;

  return (
    <>
      <NoteWorkspace noteId={noteId} />
    </>
  );
}
