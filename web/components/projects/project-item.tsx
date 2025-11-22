"use client";

import { format } from "date-fns";
import { MoreHorizontal, Trash } from "lucide-react";
import { useState } from "react";

import { PROJECT_TITLE_FALLBACK } from "@/lib/constant";
import { getRoute, ROUTES } from "@/lib/routes";
import { truncateString } from "@/lib/string";
import { cn } from "@/lib/utils";
import { useDeleteProject } from "@/service/local/api-project";

import { useBrowserNavigate } from "../browser-navigation";
import { Button } from "../ui/button";
import { useConfirmation } from "../ui/confirmation-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ProjectIcon } from "./project-icon";

type Props = {
  id: string;
  title?: string;
  tasksCount?: number;
  color?: string;
  createdAt: string;
  updatedAt: string;
};

export function ProjectItem({
  id,
  title,
  tasksCount,
  color,
  updatedAt,
}: Props) {
  const displayTitle = title || PROJECT_TITLE_FALLBACK;

  const { navigate } = useBrowserNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { mutate: deleteProject, isLoading: isDeleting } = useDeleteProject({
    onSuccess: () => {
      // Project deleted successfully
    },
    onError: (error) => {
      console.error("Failed to delete project:", error);
    },
  });

  const { confirm } = useConfirmation();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking delete
    confirm({
      title: "Delete Project",
      message: `Are you sure you want to delete "${truncateString(displayTitle, 20) || "this project"}"? This action cannot be undone.`,
      itemName: truncateString(displayTitle, 20) || "Project",
      variant: "destructive",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      onConfirm: async () => {
        await deleteProject(id);
      },
    });
  };

  const handleClick = () => {
    navigate(getRoute(ROUTES.PROJECT, { projectId: id }));
  };

  return (
    <li
      className={cn(
        "px-6 group hover:bg-muted cursor-pointer group/project-item transition-colors border-b border-b-muted group-last:border-b-0",
        isDropdownOpen && "bg-muted",
      )}
      onClick={handleClick}
    >
      <div className="flex justify-between items-center py-4">
        <div className="grid grid-cols-[28px_1fr] gap-1 gap-y-0.5 flex-1">
          <div className="flex items-center justify-start">
            <ProjectIcon className="size-6" style={{ color: color }} />
          </div>
          <h3 className="text-lg font-semibold line-clamp-1 text-ellipsis">
            {displayTitle}
          </h3>

          <p className="text-sm text-muted-foreground col-start-2 line-clamp-1 text-ellipsis">
            {!tasksCount ? (
              "No tasks"
            ) : (
              <>
                {tasksCount} task{tasksCount > 1 ? "s" : ""}
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "text-xs group-hover/project-item:hidden fade-in duration-100",
              isDropdownOpen && "hidden",
            )}
          >
            {format(new Date(updatedAt), "EEE dd/MM/yy")}
          </div>
          <div
            className={cn(
              "group-hover/project-item:block hidden",
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
                  "group-hover/project-item:block hidden w-[120px]",
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
