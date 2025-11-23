"use client";

import { MoreHorizontal, Trash } from "lucide-react";
import { useState } from "react";

import { COLLECTION_TITLE_FALLBACK } from "@/lib/constant";
import { formatDate } from "@/lib/date";
import { getRoute, ROUTES } from "@/lib/routes";
import { truncateString } from "@/lib/string";
import { cn } from "@/lib/utils";
import { useDeleteCollection } from "@/service/local/api-collection";

import { useBrowserNavigate } from "../browser-navigation";
import { Button } from "../ui/button";
import { useConfirmation } from "../ui/confirmation-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { CollectionIcon } from "./collection-icon";

type Props = {
  id: string;
  title?: string;
  notesCount?: number;
  color?: string;
  createdAt: string;
  updatedAt: string;
};

export function CollectionItem({
  id,
  title,
  notesCount,
  color,
  updatedAt,
}: Props) {
  const displayTitle = title || COLLECTION_TITLE_FALLBACK;

  const { navigate } = useBrowserNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { mutate: deleteCollection, isLoading: isDeleting } =
    useDeleteCollection({
      onSuccess: () => {
        // Collection deleted successfully
      },
      onError: (error) => {
        console.error("Failed to delete collection:", error);
      },
    });

  const { confirm } = useConfirmation();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking delete
    confirm({
      title: "Delete Collection",
      message: `Are you sure you want to delete "${truncateString(displayTitle, 20) || "this collection"}"? This action cannot be undone.`,
      itemName: truncateString(displayTitle, 20) || "Collection",
      variant: "destructive",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      onConfirm: async () => {
        await deleteCollection(id);
      },
    });
  };

  const handleClick = () => {
    navigate(getRoute(ROUTES.COLLECTION, { collectionId: id }));
  };

  return (
    <li
      className={cn(
        "px-6 group hover:bg-muted cursor-pointer group/collection-item transition-colors border-b border-b-muted group-last:border-b-0",
        isDropdownOpen && "bg-muted",
      )}
      onClick={handleClick}
    >
      <div className="flex justify-between items-center py-4">
        <div className="grid grid-cols-[28px_1fr] gap-1 gap-y-0.5 flex-1">
          <div className="flex items-center justify-start">
            <CollectionIcon
              className="size-5 text-muted-foreground"
              style={{ color: color }}
            />
          </div>
          <h3 className="text-lg font-semibold line-clamp-1 text-ellipsis">
            {displayTitle}
          </h3>

          <p className="text-sm text-muted-foreground col-start-2 line-clamp-1 text-ellipsis">
            {!notesCount ? (
              "No notes"
            ) : (
              <>
                {notesCount} note{notesCount > 1 ? "s" : ""}
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "text-xs group-hover/collection-item:hidden fade-in duration-100",
              isDropdownOpen && "hidden",
            )}
          >
            {formatDate(new Date(updatedAt))}
          </div>
          <div
            className={cn(
              "group-hover/collection-item:block hidden",
              isDropdownOpen && "block",
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
                  "group-hover/collection-item:block hidden w-[120px]",
                  isDropdownOpen && "block",
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
    </li>
  );
}
