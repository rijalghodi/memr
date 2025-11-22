// // useNoteContent.ts
// import { useEffect, useState } from "react";

// import { useDebounce } from "@/hooks/use-debounce";
// import { NOTE_TITLE_FALLBACK } from "@/lib/constant";
// import { extractFirstLineFromContent } from "@/lib/string";
// import { noteApi, NoteRes } from "@/service/local/api-note";

// export function useNoteContent(
//   note?: NoteRes,
//   noteId?: string,
//   isLoading?: boolean,
// ) {

//   // Load into memory when note changes
//   useEffect(() => {
//     if (!isLoading && note && note.id === noteId) {
//       setContent(note.content);
//     }
//   }, [noteId, note, isLoading]);

//   // Debounced content for autosave
//   const [debounced] = useDebounce(content, 400);

//   // Autosave
//   useEffect(() => {
//     if (!note || !noteId) return;
//     if (debounced == null) return;
//     if (debounced === note.content) return;

//     noteApi.update({ id: noteId, content: debounced }).then(() => {
//       const title =
//         extractFirstLineFromContent(debounced, 30) || NOTE_TITLE_FALLBACK;
//       document.title = title;
//     });
//   }, [debounced, note, noteId]);

//   return { content, setContent };
// }
