"use client";

import { Plus } from "lucide-react";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { ReactSortable } from "react-sortablejs";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui";
import { TaskAdd } from "./task-add";

export type Task = {
  id: string;
  group: string;
  title: string;
  description?: string;
  status?: number;
  sortOrder?: number | string;
  dueDate?: string;
};

// Group item for list reordering (ReactSortable requires objects with id)
export type GroupItem = { id: string; title: string };

// Helper function to group tasks by group
function groupTasksByGroup(tasks: Task[]): Record<string, Task[]> {
  return tasks?.reduce(
    (acc, task) => {
      if (!acc[task.group]) {
        acc[task.group] = [];
      }
      acc[task.group].push(task);
      return acc;
    },
    {} as Record<string, Task[]>
  );
}

// Card component
const Card: React.FC<{ task: Task }> = ({ task }) => (
  <div className="bg-card border border-border rounded-sm px-3 py-3 space-y-1 hover:bg-muted transition-colors cursor-move">
    <div className="text-sm font-medium text-foreground line-clamp-2 leading-none">
      {task.title}
    </div>
    {task.description && (
      <div className="text-xs text-muted-foreground line-clamp-1 leading-none">
        {task.description}
      </div>
    )}
  </div>
);

// List component
const List: React.FC<{
  groupId: string;
  groupTitle: string;
  tasks: Task[];
  onTaskDrop: (group: string, newTasks: Task[], oldTasks: Task[]) => void;
  onTaskAdd: (
    groupId: string,
    taskData: Pick<Task, "title" | "dueDate" | "description">
  ) => void;
}> = ({ groupId, groupTitle, tasks, onTaskDrop, onTaskAdd }) => {
  const previousTasksRef = useRef<Task[]>(tasks);
  const [open, setOpen] = useState(false);

  const handleSetList = useCallback(
    (newTasks: Task[]) => {
      const oldTasks = previousTasksRef.current;
      onTaskDrop(groupId, newTasks, oldTasks);
      previousTasksRef.current = newTasks;
    },
    [groupId, onTaskDrop]
  );

  // Update ref when tasks change from external source
  React.useEffect(() => {
    previousTasksRef.current = tasks;
  }, [tasks]);

  return (
    <div className="flex flex-col h-full w-full max-w-[280px] rounded-lg">
      <Collapsible open={open} onOpenChange={setOpen} className="w-full">
        <header className="space-y-1 px-2 py-2 cursor-move list-title">
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
              className="fixed inset-0 z-999"
              onClick={() => setOpen(false)}
            ></div>
          )}
          <CollapsibleContent className={cn("relative", open && "z-1000")}>
            <TaskAdd
              onSubmit={(data) => {
                onTaskAdd(groupId, data);
              }}
            />
          </CollapsibleContent>
        </header>
      </Collapsible>

      <ScrollArea className="flex-1">
        <div className={cn("p-2")}>
          <ReactSortable
            list={tasks}
            setList={handleSetList}
            group="kanban-tasks"
            animation={200}
            className={cn(
              "space-y-2 min-h-[300px]",
              tasks.length === 0 && "bg-muted/50 rounded-md"
            )}
            ghostClass="opacity-50"
            dragClass="cursor-grabbing"
          >
            {tasks.map((task) => (
              <Card key={task.id} task={task} />
            ))}
          </ReactSortable>
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
};

// Main Kanban component
export function Kanban({
  tasks,
  onTaskUpdate,
  onTaskAdd,
  onTaskDelete,
  groupOrder,
}: {
  tasks: Task[];
  onTaskUpdate: (data: Task) => void;
  onTaskAdd: (
    group: string,
    data: Pick<Task, "title" | "dueDate" | "description">
  ) => void;
  onTaskDelete: (data: Task) => void;
  groupOrder: GroupItem[];
}) {
  // Group tasks by group
  const tasksByGroup = useMemo(() => {
    return groupTasksByGroup(tasks);
  }, [tasks]);

  // Handle task drop within same list or between lists
  const handleTaskDrop = useCallback(
    (group: string, newTasks: Task[], oldTasks: Task[]) => {
      // Find tasks that were added (moved from another list)
      const addedTasks = newTasks.filter(
        (task) => !oldTasks.some((t) => t.id === task.id)
      );

      // Update group for tasks that were moved to this list
      addedTasks.forEach((task) => {
        if (task.group !== group) {
          onTaskUpdate({
            ...task,
            group: group,
            sortOrder: newTasks.indexOf(task).toString(),
          });
        }
      });

      // Update sortOrder for tasks that were reordered within this list
      newTasks.forEach((task, index) => {
        const oldIndex = oldTasks.findIndex((t) => t.id === task.id);
        if (oldIndex !== -1 && oldIndex !== index && task.group === group) {
          onTaskUpdate({
            ...task,
            sortOrder: index.toString(),
          });
        }
      });
    },
    [onTaskUpdate]
  );

  // Handle task add
  const handleTaskAdd = useCallback(
    (
      group: string,
      taskData: Pick<Task, "title" | "dueDate" | "description">
    ) => {
      onTaskAdd(group, {
        ...taskData,
        group: group,
        title: taskData.title,
        description: taskData.description || undefined,
        dueDate: taskData.dueDate || undefined,
      } as Task);
    },
    [onTaskAdd]
  );

  // Handle list reorder (group columns)
  const [groupOrderState, setGroupOrderState] =
    useState<GroupItem[]>(groupOrder);

  const handleListReorder = useCallback((newOrder: GroupItem[]) => {
    setGroupOrderState(newOrder);
  }, []);

  // Update group order state when prop changes
  React.useEffect(() => {
    setGroupOrderState(groupOrder);
  }, [groupOrder]);

  return (
    <div id="kanban" className="h-full w-full flex flex-col">
      <ScrollArea className="flex-1 w-full">
        <div className="h-full">
          <ReactSortable
            list={groupOrderState}
            setList={handleListReorder}
            animation={200}
            handle=".list-title"
            direction="horizontal"
            className="flex gap-0 h-full"
          >
            {groupOrderState.map((groupItem) => {
              const groupTasks = tasksByGroup[groupItem.title] || [];
              return (
                <List
                  key={groupItem.id}
                  groupId={groupItem.id}
                  groupTitle={groupItem.title}
                  tasks={groupTasks}
                  onTaskDrop={handleTaskDrop}
                  onTaskAdd={handleTaskAdd}
                />
              );
            })}
          </ReactSortable>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
