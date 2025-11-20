"use client";

import { FileText, MoreHorizontal, Trash } from "lucide-react";
import React, { useState } from "react";

import { useDeleteNote } from "@/service/local/api-note";

import { Button } from "../ui/button";
import { useConfirmation } from "../ui/confirmation-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  extractFirstLineFromContent,
  markdownToText,
  truncateString,
} from "@/lib/string";
import { ROUTES } from "@/lib/routes";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useSessionTabs } from "../session-tabs";
import {
  NOTE_CONTENT_EXCERPT_FALLBACK,
  NOTE_TITLE_FALLBACK,
} from "@/lib/constant";

type Props = {
  id: string;
  content?: string;
  createdAt: string;
  updatedAt: string;
};

export function NoteItem({ id, content = "", createdAt, updatedAt }: Props) {
  const displayContent = content
    ? markdownToText(content, 200)
    : NOTE_CONTENT_EXCERPT_FALLBACK;

  const displayTitle = content
    ? extractFirstLineFromContent(content, 80)
    : NOTE_TITLE_FALLBACK;

  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { mutate: deleteNote, isLoading: isDeleting } = useDeleteNote({
    onSuccess: () => {
      // Note deleted successfully
    },
    onError: (error) => {
      console.error("Failed to delete note:", error);
    },
  });

  const { confirm } = useConfirmation();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking delete
    confirm({
      title: "Delete Note",
      message: `Are you sure you want to delete "${truncateString(displayTitle, 20) || "this note"}"? This action cannot be undone.`,
      itemName: truncateString(displayTitle, 20) || "Note",
      variant: "destructive",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      onConfirm: async () => {
        await deleteNote(id);
      },
    });
  };

  const { addTab } = useSessionTabs();
  const handleClick = () => {
    router.push(ROUTES.NOTE(id));
    addTab({
      title: displayTitle,
      pathname: ROUTES.NOTE(id),
    });
  };

  return (
    <div
      className={cn(
        "px-6 group hover:bg-muted cursor-pointer group/note-item transition-colors",
        isDropdownOpen && "bg-muted"
      )}
      onClick={handleClick}
    >
      <div className="flex justify-between items-center py-4 border-b group-last:border-b-0">
        <div className="grid grid-cols-[28px_1fr] gap-1 gap-y-0.5 flex-1">
          <div className="flex items-center justify-start">
            <FileText className="size-4 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold line-clamp-1 text-ellipsis">
            {displayTitle}
          </h3>
          <p className="text-sm text-muted-foreground col-start-2 line-clamp-1 text-ellipsis">
            {displayContent}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "text-xs group-hover/note-item:hidden fade-in duration-100",
              isDropdownOpen && "hidden"
            )}
          >
            {format(new Date(updatedAt), "EEE dd/MM/yy")}
          </div>
          <div
            className={cn(
              "group-hover/note-item:block hidden",
              isDropdownOpen && "block"
            )}
          >
            <DropdownMenu
              open={isDropdownOpen}
              onOpenChange={setIsDropdownOpen}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isDeleting}
                  className="hover:bg-accent"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "group-hover/note-item:block hidden w-[120px]",
                  isDropdownOpen && "block"
                )}
              >
                <DropdownMenuItem
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash className="size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
