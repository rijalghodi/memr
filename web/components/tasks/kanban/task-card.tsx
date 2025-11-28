import { isToday } from "date-fns";
import { CalendarIcon, MoreVertical, Trash } from "lucide-react";
import { useState } from "react";

import { ProjectIcon } from "@/components/projects/project-icon";
import {
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui";
import { DatePickerContent } from "@/components/ui/date-picker";
import { TASK_TITLE_FALLBACK } from "@/lib/constant";
import { cn } from "@/lib/utils";

import { TaskDatePicker } from "./task-date-picker";
import { TaskProjectPicker, TaskProjectPickerContent } from "./task-project-picker";
import type { TKanbanTask } from "./type";

type Props = {
  task: TKanbanTask;
  onTaskUpdate?: (id: string, data: Partial<TKanbanTask>) => void;
  onTaskDelete?: (id: string) => void;
};

export function TaskCard({ task, onTaskUpdate, onTaskDelete }: Props) {
  const [moreOpen, setMoreOpen] = useState(false);
  return (
    <div
      className={cn(
        "has-[*[data-state=open]]:bg-muted group/task-card relative bg-card border border-border rounded-sm px-3 py-3 space-y-1 hover:bg-muted transition-colors cursor-move shadow-sm"
      )}
    >
      <div className="flex items-start gap-2">
        <Checkbox
          checked={task.status === 2}
          onCheckedChange={(checked) => onTaskUpdate?.(task.id, { status: checked ? 2 : 0 })}
          onClick={(e) => {
            e.stopPropagation();
          }}
          data-overdue={
            task.dueDate &&
            !isToday(new Date(task.dueDate)) &&
            new Date(task.dueDate) < new Date() &&
            task.status !== 2
          }
          className={cn("border-muted-foreground mt-1 data-[overdue=true]:border-destructive")}
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
            "w-full text-sm font-medium border-none p-0.5 shadow-none rounded-xs outline-none ring-0",
            "focus:bg-accent",
            task.status === 2 && "line-through text-muted-foreground"
          )}
          placeholder={TASK_TITLE_FALLBACK}
        />
      </div>
      <div className="flex items-center gap-2">
        {task.dueDate && (
          <TaskDatePicker
            isOverdue={(date) =>
              date && !isToday(new Date(date)) && new Date(date) < new Date() && task.status !== 2
            }
            value={new Date(task.dueDate)}
            onChange={(date) =>
              onTaskUpdate?.(task.id, {
                dueDate: date?.toISOString(),
              })
            }
          />
        )}

        {task.projectId && (
          <TaskProjectPicker
            value={task.projectId}
            onChange={(projectId) =>
              onTaskUpdate?.(task.id, {
                projectId: projectId,
              })
            }
          />
        )}

        <DropdownMenu open={moreOpen} onOpenChange={setMoreOpen}>
          <DropdownMenuTrigger
            asChild
            className="absolute right-2 top-2 opacity-0 group-hover/task-card:opacity-100 data-[state=open]:opacity-100 transition-opacity duration-300"
          >
            <Button variant="secondary" size="icon-sm" onClick={(e) => e.stopPropagation()}>
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <CalendarIcon />
                Set Due Date
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DatePickerContent
                    date={task.dueDate ? new Date(task.dueDate) : undefined}
                    onSelect={(date) =>
                      onTaskUpdate?.(task.id, {
                        dueDate: date?.toISOString(),
                      })
                    }
                    onClose={() => setMoreOpen(false)}
                  />
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <ProjectIcon />
                Set Project
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <TaskProjectPickerContent
                    value={task.projectId}
                    onChange={(projectId) =>
                      onTaskUpdate?.(task.id, {
                        projectId: projectId ?? undefined,
                      })
                    }
                    onClose={() => setMoreOpen(false)}
                  />
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuItem
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                onTaskDelete?.(task.id);
              }}
            >
              <Trash />
              Delete task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
