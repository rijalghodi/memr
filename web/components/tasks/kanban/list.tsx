import { Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ReactSortable } from "react-sortablejs";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../ui";
import { Card } from "./card";
import { TaskAdd } from "./task-add";
import { TKanbanTask } from "./type";

type ListProps = {
  groupId: string;
  groupTitle: string;
  tasks: TKanbanTask[];
  onTaskDrop: (
    group: string,
    newTasks: TKanbanTask[],
    oldTasks: TKanbanTask[],
  ) => void;
  onTaskAdd: (groupId: string, taskData: TKanbanTask) => void;
  onTaskUpdate?: (id: string, data: Partial<TKanbanTask>) => void;
};

export function List({
  groupId,
  groupTitle,
  tasks,
  onTaskDrop,
  onTaskAdd,
  onTaskUpdate,
}: ListProps) {
  const previousTasksRef = useRef<TKanbanTask[]>(tasks);
  const [open, setOpen] = useState(false);

  const handleSetList = useCallback(
    (newTasks: TKanbanTask[]) => {
      const oldTasks = previousTasksRef.current;
      onTaskDrop(groupId, newTasks, oldTasks);
      previousTasksRef.current = newTasks;
    },
    [groupId, onTaskDrop],
  );

  // Update ref when tasks change from external source
  useEffect(() => {
    previousTasksRef.current = tasks;
  }, [tasks]);

  return (
    <div className="flex flex-col h-full w-full max-w-[280px] rounded-lg">
      <Collapsible open={open} onOpenChange={setOpen} className="w-full">
        <header className="px-2 space-y-1 py-2 cursor-move list-title">
          <div className="flex items-center justify-between">
            <div className="flex items-end gap-2">
              <h2 className="font-semibold text-sm leading-none capitalize">
                {groupTitle}
              </h2>
              <span className="text-xs text-muted-foreground leading-none">
                {tasks.length}
              </span>
            </div>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className={cn("group relative", open && "z-1000")}
              >
                <Plus className="group-data-[state=open]:rotate-135 transition-transform" />
              </Button>
            </CollapsibleTrigger>
          </div>
          {/* Overlay */}
          {open && (
            <div
              className="fixed inset-0 z-50"
              onClick={() => setOpen(false)}
            />
          )}
          <CollapsibleContent className={cn("relative", open && "z-50")}>
            <TaskAdd
              onSubmit={(data) => {
                onTaskAdd(groupId, {
                  ...data,
                  groupId: groupId,
                } as TKanbanTask);
              }}
            />
          </CollapsibleContent>
        </header>
      </Collapsible>

      <ScrollArea className="flex-1 flex items-stretch overflow-y-auto">
        <ReactSortable
          list={tasks}
          setList={handleSetList}
          group="kanban-tasks"
          animation={200}
          className={cn(
            "space-y-2 pb-2 px-2 h-full min-h-[400px]",
            tasks.length === 0 && "bg-muted/50 rounded-md",
          )}
          ghostClass="opacity-50"
          dragClass="cursor-grabbing"
        >
          {tasks.map((task) => (
            <Card key={task.id} task={task} onTaskUpdate={onTaskUpdate} />
          ))}
        </ReactSortable>

        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
}
