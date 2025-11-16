"use client";

import React from "react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { FileText, MoreHorizontal, Trash } from "lucide-react";
import { useDeleteNote } from "@/service/local/api-note";
import { useConfirmation } from "../ui/confirmation-dialog";

type Props = {
  id: string;
  title?: string;
  content?: string;
  createdAt: string;
  updatedAt: string;
};

export function NoteItem({ id, title, content, createdAt, updatedAt }: Props) {
  const { mutate: deleteNote, isLoading: isDeleting } = useDeleteNote({
    onSuccess: () => {
      // Note deleted successfully
    },
    onError: (error) => {
      console.error("Failed to delete note:", error);
    },
  });

  const { confirm } = useConfirmation();

  const handleDelete = () => {
    confirm({
      title: "Delete Note",
      message: `Are you sure you want to delete "${title || "this note"}"? This action cannot be undone.`,
      itemName: title || "Note",
      variant: "destructive",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      onConfirm: async () => {
        await deleteNote(id);
      },
    });
  };

  const displayTitle = title || "Untitled Note";
  const displayContent = content || "";

  return (
    <div className="px-6 group hover:bg-muted cursor-pointer">
      <div className="flex justify-between items-center py-6 border-b group-last:border-b-0">
        <div className="grid grid-cols-[28px_1fr] gap-1 flex-1">
          <div className="flex items-center justify-start">
            <FileText className="size-5 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold">{displayTitle}</h3>
          {displayContent && (
            <p className="text-sm text-muted-foreground col-start-2">
              {displayContent}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" disabled={isDeleting}>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
  );
}
