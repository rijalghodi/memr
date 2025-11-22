import { useEffect, useRef, useState } from "react";

import { PopoverContent } from "@/components/ui/popover";
import { useDebounce } from "@/hooks/use-debounce";
import { TASK_TITLE_FALLBACK } from "@/lib/constant";

import type { TKanbanTask } from "./type";

type TaskUpdateProps = {
  task: TKanbanTask;
  onTaskUpdate?: (id: string, data: Partial<TKanbanTask>) => void;
};

export function TaskUpdate({ task, onTaskUpdate }: TaskUpdateProps) {
  const [title, setTitle] = useState(task.title || "");
  const [debouncedTitle] = useDebounce(title, 300);
  const isUserEditingRef = useRef(false);

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

  return (
    <PopoverContent
      side="right"
      align="start"
      className="p-4 shadow-2xl"
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
  );
}
