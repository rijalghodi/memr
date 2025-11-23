import { useState } from "react";

import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { useClickOrDrag } from "@/hooks/use-click-or-drag";
import { TASK_TITLE_FALLBACK } from "@/lib/constant";

import { TaskUpdate } from "./task-update";
import type { TKanbanTask } from "./type";

type CardProps = {
  task: TKanbanTask;
  onTaskUpdate?: (id: string, data: Partial<TKanbanTask>) => void;
};

// Card component
export function Card({ task, onTaskUpdate }: CardProps) {
  const [open, setOpen] = useState(false);

  const handlers = useClickOrDrag({
    onClick: () => {},
    onDrag: () => {
      setOpen(false);
    },
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          {...handlers}
          className="bg-card border border-border rounded-sm px-3 py-3 space-y-1 hover:bg-muted transition-colors cursor-move shadow-sm"
        >
          <div className="text-sm font-medium text-foreground line-clamp-2">
            {task.title || TASK_TITLE_FALLBACK}
          </div>
          {task.description && (
            <div className="text-xs text-muted-foreground line-clamp-1 leading-none">
              {task.description}
            </div>
          )}
        </div>
      </PopoverTrigger>
      <TaskUpdate task={task} onTaskUpdate={onTaskUpdate} />
    </Popover>
  );
}
