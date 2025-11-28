import { useEffect, useRef, useState } from "react";

import { Checkbox } from "@/components/ui";
import { PopoverContent } from "@/components/ui/popover";
import { TASK_TITLE_FALLBACK } from "@/lib/constant";

import { TaskDatePicker } from "./task-date-picker";
import { TaskProjectPicker } from "./task-project-picker";
import type { TKanbanTask } from "./type";

type TaskUpdateProps = {
  task: TKanbanTask;
  onTaskUpdate?: (id: string, data: Partial<TKanbanTask>) => void;
};

export function TaskUpdate({ task, onTaskUpdate }: TaskUpdateProps) {
  const [title, setTitle] = useState(task.title || "");
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task.dueDate ? new Date(task.dueDate) : undefined
  );
  const [projectId, setProjectId] = useState<string | null | undefined>(task.projectId);
  const isUserEditingRef = useRef(false);

  // Update state when task changes externally (only if user is not editing)
  // Sync props to state for controlled inputs - this is a valid use case
  useEffect(() => {
    if (!isUserEditingRef.current) {
      const newTitle = task.title || "";
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle((prevTitle) => (prevTitle !== newTitle ? newTitle : prevTitle));
    }

    const newDueDate = task.dueDate ? new Date(task.dueDate) : undefined;
    setDueDate((prevDueDate) => {
      const prevTime = prevDueDate?.getTime();
      const newTime = newDueDate?.getTime();
      return prevTime !== newTime ? newDueDate : prevDueDate;
    });

    setProjectId((prevProjectId) =>
      prevProjectId !== task.projectId ? task.projectId : prevProjectId
    );
  }, [task.title, task.dueDate, task.projectId]);

  const handleTitleChange = (title: string) => {
    setTitle(title);
    if (onTaskUpdate) {
      onTaskUpdate(task.id, { title });
    }
  };

  // Update task when dueDate changes
  const handleDueDateChange = (date: Date | undefined) => {
    setDueDate(date);
    if (onTaskUpdate) {
      onTaskUpdate(task.id, {
        dueDate: date?.toISOString() ?? undefined,
      });
    }
  };

  // Update task when projectId changes
  const handleProjectChange = (selectedProjectId?: string | null) => {
    setProjectId(selectedProjectId);
    if (onTaskUpdate) {
      onTaskUpdate(task.id, {
        projectId: selectedProjectId,
      });
    }
  };

  return (
    <PopoverContent
      side="right"
      align="start"
      className="p-3 rounded-lg shadow-2xl w-80"
      onOpenAutoFocus={(e) => e.preventDefault()}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={task.status === 2}
            onCheckedChange={(checked) => onTaskUpdate?.(task.id, { status: checked ? 2 : 0 })}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="border-muted-foreground"
          />
          <input
            type="text"
            value={title}
            onChange={(e) => {
              isUserEditingRef.current = true;
              handleTitleChange(e.target.value);
            }}
            className="text-sm font-medium text-foreground bg-transparent border-0 outline-none focus:outline-none focus:ring-0 p-0 w-full"
            placeholder={TASK_TITLE_FALLBACK}
            autoFocus
          />
        </div>

        <div className="flex items-center gap-2">
          <TaskDatePicker value={dueDate} onChange={handleDueDateChange} />
          <TaskProjectPicker value={projectId} onChange={handleProjectChange} />
        </div>
      </div>
    </PopoverContent>
  );
}
