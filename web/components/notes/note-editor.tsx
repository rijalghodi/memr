import React from "react";
import { RichTextEditor } from "../ui/rich-text/rich-text-editor";

type Props = {};

export function NoteEditor({}: Props) {
  return (
    <div className="flex flex-col max-h-[calc(100vh-100px)] overflow-y-auto">
      <div className="pt-6 pb-0 w-full px-[120px]">
        <input
          type="text"
          placeholder="Untitled"
          className="w-fit tex-2xl p-2 md:text-3xl lg:text-5xl font-bold focus:outline-none border-none focus:ring-0 focus:bg-accent rounded-lg"
        />
      </div>
      <div className="w-full">
        <RichTextEditor />
      </div>
    </div>
  );
}
