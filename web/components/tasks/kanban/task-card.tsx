import { useState } from "react";

import { Checkbox } from "@/components/ui";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { useClickOrDrag } from "@/hooks/use-click-or-drag";
import { TASK_TITLE_FALLBACK } from "@/lib/constant";

import { TaskDatePicker } from "./task-date-picker";
import { TaskProjectSelector } from "./task-project-selector";
import { TaskUpdate } from "./task-update";
import type { TKanbanTask } from "./type";
type Props = {
  task: TKanbanTask;
  onTaskUpdate?: (id: string, data: Partial<TKanbanTask>) => void;
};

export function TaskCard({ task, onTaskUpdate }: Props) {
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
          <div className="flex items-center gap-2">
            <Checkbox
              checked={task.status === 2}
              onCheckedChange={(checked) =>
                onTaskUpdate?.(task.id, { status: checked ? 2 : 0 })
              }
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="border-muted-foreground"
            />

            <span className="text-sm font-medium text-foreground line-clamp-2">
              {task.title || TASK_TITLE_FALLBACK}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {task.dueDate && (
              <TaskDatePicker
                value={new Date(task.dueDate)}
                onChange={(date) =>
                  onTaskUpdate?.(task.id, {
                    dueDate: date?.toISOString(),
                  })
                }
              />
            )}

            {task.projectId && (
              <TaskProjectSelector
                value={task.projectId}
                onChange={(projectId) =>
                  onTaskUpdate?.(task.id, {
                    projectId: projectId,
                  })
                }
              />
            )}
          </div>
        </div>
      </PopoverTrigger>
      <TaskUpdate task={task} onTaskUpdate={onTaskUpdate} />
    </Popover>
  );
}
