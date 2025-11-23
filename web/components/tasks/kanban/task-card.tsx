import { Checkbox } from "@/components/ui";
import { TASK_TITLE_FALLBACK } from "@/lib/constant";
import { cn } from "@/lib/utils";

import { TaskDatePicker } from "./task-date-picker";
import { TaskProjectSelector } from "./task-project-selector";
import type { TKanbanTask } from "./type";
type Props = {
  task: TKanbanTask;
  onTaskUpdate?: (id: string, data: Partial<TKanbanTask>) => void;
};

export function TaskCard({ task, onTaskUpdate }: Props) {
  // const [open, setOpen] = useState(false);

  // const handlers = useClickOrDrag({
  //   onClick: () => {},
  //   onDrag: () => {
  //     setOpen(false);
  //   },
  // });

  return (
    <div className="bg-card border border-border rounded-sm px-3 py-3 space-y-1 hover:bg-muted transition-colors cursor-move shadow-sm">
      <div className="flex items-start gap-2">
        <Checkbox
          checked={task.status === 2}
          onCheckedChange={(checked) =>
            onTaskUpdate?.(task.id, { status: checked ? 2 : 0 })
          }
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="border-muted-foreground mt-1"
        />

        <input
          value={task.title}
          onChange={(e) => {
            onTaskUpdate?.(task.id, { title: e.target.value });
          }}
          onBlur={(e) => {
            onTaskUpdate?.(task.id, { title: e.target.value });
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
          className={cn(
            "w-full text-sm font-medium text-foreground/90 border-none p-0.5 shadow-none rounded-xs outline-none ring-0",
            "focus:bg-accent"
          )}
          placeholder={TASK_TITLE_FALLBACK}
        />
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
  );
}
