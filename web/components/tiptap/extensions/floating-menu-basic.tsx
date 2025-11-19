import type { Editor } from "@tiptap/core";
import { FloatingMenu } from "@tiptap/react";
import { useState } from "react";

export function FloatingMenuBasic({ editor }: { editor: Editor }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <FloatingMenu
      editor={editor}
      //   appendTo={document.body}
      // shouldShow={({ state }) => {
      //   // Always show the menu - accept the props parameter even if unused
      //   return true;
      // }}
      shouldShow={({ state }) => {
        if (!editor) return false;

        const { $from } = state.selection;
        const currentLineText = $from.parent.textBetween(
          0,
          $from.parentOffset,
          "\n",
          " ",
        );

        const isSlashCommand =
          currentLineText.startsWith("/") &&
          $from.parent.type.name !== "codeBlock" &&
          $from.parentOffset === currentLineText.length;

        if (!isSlashCommand) {
          if (isOpen) setIsOpen(false);
          return false;
        }

        const query = currentLineText.slice(1).trim();
        // if (query !== search) setSearch(query);
        if (!isOpen) setIsOpen(true);
        return true;
      }}
    >
      <div className="floating-menu" data-testid="floating-menu">
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={
            editor.isActive("heading", { level: 1 }) ? "is-active" : ""
          }
        >
          H1
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={
            editor.isActive("heading", { level: 2 }) ? "is-active" : ""
          }
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "is-active" : ""}
        >
          Bullet list
        </button>
      </div>
    </FloatingMenu>
  );
}
