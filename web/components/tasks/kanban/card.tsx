import { useCallback, useEffect, useRef, useState } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDebounce } from "@/hooks/use-debounce";
import { TASK_TITLE_FALLBACK } from "@/lib/constant";

import type { TKanbanTask } from "./type";

type CardProps = {
  task: TKanbanTask;
  onTaskUpdate?: (id: string, data: Partial<TKanbanTask>) => void;
};

// Card component
export function Card({ task, onTaskUpdate }: CardProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(task.title || "");
  const debouncedTitle = useDebounce(title, 300);
  const isUserEditingRef = useRef(false);
  const mouseDownRef = useRef<{ x: number; y: number; time: number } | null>(
    null
  );

  // Update title when task changes externally (only if user is not editing)
  // Sync props to state for controlled input - this is a valid use case
  useEffect(() => {
    if (!isUserEditingRef.current) {
      const newTitle = task.title || "";
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle((prevTitle) => (prevTitle !== newTitle ? newTitle : prevTitle));
    }
  }, [task.title]);

  // Update task when debounced title changes
  useEffect(() => {
    if (debouncedTitle !== task.title && onTaskUpdate) {
      onTaskUpdate(task.id, { title: debouncedTitle });
      isUserEditingRef.current = false;
    }
  }, [debouncedTitle, task.id, task.title, onTaskUpdate]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    mouseDownRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    };
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!mouseDownRef.current) return;

    const { x, y, time } = mouseDownRef.current;
    const distance = Math.sqrt(
      Math.pow(e.clientX - x, 2) + Math.pow(e.clientY - y, 2)
    );
    const timeDiff = Date.now() - time;

    // Only open popover if it's a click (not a drag) - small movement and quick click
    if (distance < 5 && timeDiff < 300) {
      e.stopPropagation();
      setOpen(true);
    }

    mouseDownRef.current = null;
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className="bg-card border border-border rounded-sm px-3 py-3 space-y-1 hover:bg-muted transition-colors cursor-move"
          onMouseDown={handleMouseDown}
          onClick={handleClick}
        >
          <div className="text-sm font-medium text-foreground line-clamp-2 font-mono">
            {task.title || TASK_TITLE_FALLBACK} {task.sortOrder}
          </div>
          {task.description && (
            <div className="text-xs text-muted-foreground line-clamp-1 leading-none">
              {task.description}
            </div>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        className="p-4"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <input
          type="text"
          value={title}
          onChange={(e) => {
            isUserEditingRef.current = true;
            setTitle(e.target.value);
          }}
          className="text-sm font-medium text-foreground bg-transparent border-0 outline-none focus:outline-none focus:ring-0 p-0 w-full"
          placeholder={TASK_TITLE_FALLBACK}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
