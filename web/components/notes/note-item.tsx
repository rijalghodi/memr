"use client";

import { MoreHorizontal, Trash } from "lucide-react";
import React, { useMemo, useState } from "react";

import { getCssColorStyle } from "@/lib/color";
import { NOTE_CONTENT_EXCERPT_FALLBACK, NOTE_TITLE_FALLBACK } from "@/lib/constant";
import { formatDate } from "@/lib/date";
import { getRoute, ROUTES } from "@/lib/routes";
import { markdownToText, truncateString } from "@/lib/string";
import { cn } from "@/lib/utils";
import { useGetCollections } from "@/service/local/api-collection";
import { useDeleteNote, useUpdateNote } from "@/service/local/api-note";

import { useBrowserNavigate } from "../browser-navigation";
import { CollectionIcon } from "../collections/collection-icon";
import { Button } from "../ui/button";
import { useConfirmation } from "../ui/confirmation-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { NoteCollectionPickerContent } from "./note-collection-picker";
import { NoteIcon } from "./note-icon";

type Props = {
  id: string;
  title?: string;
  content?: string;
  collectionId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export function NoteItem({ id, title, content = "", collectionId, updatedAt }: Props) {
  const displayContent = content ? markdownToText(content, 200) : NOTE_CONTENT_EXCERPT_FALLBACK;
  const displayTitle = title || NOTE_TITLE_FALLBACK;

  const { navigate } = useBrowserNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { mutate: deleteNote, isLoading: isDeleting } = useDeleteNote({
    onSuccess: () => {
      // Note deleted successfully
    },
    onError: (error) => {
      console.error("Failed to delete note:", error);
    },
  });

  const { mutate: updateNote } = useUpdateNote({
    onSuccess: () => {
      // Note updated successfully
    },
    onError: (error) => {
      console.error("Failed to update note:", error);
    },
  });
  const { data: collections } = useGetCollections();

  const currentCollection = useMemo(() => {
    return collections?.find((c) => c.id === collectionId);
  }, [collections, collectionId]);

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

  const handleClick = () => {
    navigate(getRoute(ROUTES.NOTE, { noteId: id }));
  };

  const handleChangeCollection = (collectionId: string | null) => {
    updateNote({
      id: id,
      collectionId: collectionId,
    });
  };

  return (
    <li
      className={cn(
        "px-6 group hover:bg-muted cursor-pointer group/note-item transition-colors border-b border-b-muted group-last:border-b-0",
        isDropdownOpen && "bg-muted"
      )}
      onClick={handleClick}
    >
      <div className="flex justify-between items-center py-4">
        <div className="grid grid-cols-[28px_1fr] gap-1 gap-y-0.5 flex-1">
          <div className="flex items-center justify-start">
            <NoteIcon className="size-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-medium line-clamp-1">{displayTitle}</h3>
            {currentCollection && (
              <div
                className="text-xs px-1.5 py-0.5 rounded-sm inline-flex items-center gap-1 shrink-0"
                style={getCssColorStyle(currentCollection?.color ?? "")}
              >
                <CollectionIcon className="size-3" />
                {currentCollection?.title}
              </div>
            )}
          </div>
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
            {formatDate(new Date(updatedAt))}
          </div>
          <div className={cn("group-hover/note-item:block hidden", isDropdownOpen && "block")}>
            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
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
                  "group-hover/note-item:block hidden w-auto",
                  isDropdownOpen && "block"
                )}
              >
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <CollectionIcon className="size-4" />
                    Set Collection
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-56">
                    <NoteCollectionPickerContent
                      value={collectionId}
                      onChange={handleChangeCollection}
                      onClose={() => setIsDropdownOpen(false)}
                    />
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
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
    </li>
  );
}
