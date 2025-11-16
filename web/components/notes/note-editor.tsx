import React from "react";
import { RichTextEditor } from "../ui/rich-text/rich-text-editor";

type Props = {};

export function NoteEditor({}: Props) {
  return (
    <div>
      <input
        type="text"
        placeholder="Untitled"
        className="w-full text-2xl font-semibold focus:outline-none border-none focus:ring-0 focus:bg-accent"
      />
      <RichTextEditor />
    </div>
  );
}
