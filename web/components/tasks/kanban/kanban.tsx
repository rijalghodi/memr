"use client";

import { Plus } from "lucide-react";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { ReactSortable } from "react-sortablejs";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { TASK_TITLE_FALLBACK } from "@/lib/constant";
import {
  generateBetweenRank,
  generateNBetweenKeys,
} from "@/lib/fractional-idx";
import { cn } from "@/lib/utils";

import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../ui";
import { TaskAdd } from "./task-add";

export type TKanbanTask = {
  id: string;
  groupId: string;
  title?: string;
  description?: string;
  status?: number;
  sortOrder?: string;
  dueDate?: string;
};

// Group item for list reordering (ReactSortable requires objects with id)
export type GroupItem = { id: string; title: string };

// Helper function to group tasks by group
function groupTasksByGroup(
  tasks: TKanbanTask[]
): Record<string, TKanbanTask[]> {
  return tasks?.reduce(
    (acc, task) => {
      if (!acc[task.groupId]) {
        acc[task.groupId] = [];
      }
      acc[task.groupId].push(task);
      return acc;
    },
    {} as Record<string, TKanbanTask[]>
  );
}

// Card component
const Card: React.FC<{ task: TKanbanTask }> = ({ task }) => (
  <div className="bg-card border border-border rounded-sm px-3 py-3 space-y-1 hover:bg-muted transition-colors cursor-move">
    <div className="text-sm font-medium text-foreground line-clamp-2 leading-none">
      {task.title || TASK_TITLE_FALLBACK}
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
  tasks: TKanbanTask[];
  onTaskDrop: (
    group: string,
    newTasks: TKanbanTask[],
    oldTasks: TKanbanTask[]
  ) => void;
  onTaskAdd: (groupId: string, taskData: TKanbanTask) => void;
}> = ({ groupId, groupTitle, tasks, onTaskDrop, onTaskAdd }) => {
  // Sort tasks by sortOrder
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const aOrder = a.sortOrder || "";
      const bOrder = b.sortOrder || "";
      return aOrder.localeCompare(bOrder);
    });
  }, [tasks]);

  const previousTasksRef = useRef<TKanbanTask[]>(sortedTasks);
  const [open, setOpen] = useState(false);

  const handleSetList = useCallback(
    (newTasks: TKanbanTask[]) => {
      const oldTasks = previousTasksRef.current;
      onTaskDrop(groupId, newTasks, oldTasks);
      previousTasksRef.current = newTasks;
    },
    [groupId, onTaskDrop]
  );

  // Update ref when tasks change from external source
  React.useEffect(() => {
    previousTasksRef.current = sortedTasks;
  }, [sortedTasks]);

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
                {sortedTasks.length}
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
                onTaskAdd(groupId, {
                  ...data,
                  groupId: groupId,
                } as TKanbanTask);
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
              sortedTasks.length === 0 && "bg-muted/50 rounded-md"
            )}
            ghostClass="opacity-50"
            dragClass="cursor-grabbing"
          >
            {sortedTasks.map((task) => (
              <Card key={task.id} task={task} />
            ))}
          </ReactSortable>
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
};

type KanbanTaskProps = {
  tasks: TKanbanTask[];
  onTaskUpdate: (id: string, data: Partial<TKanbanTask>) => void;
  onTaskAdd: (groupId: string, data: TKanbanTask) => void;
  onTaskDelete: (id: string) => void;
  groups: GroupItem[];
};

// Main Kanban component
export function KanbanTask({
  tasks,
  onTaskUpdate,
  onTaskAdd,
  onTaskDelete: _onTaskDelete,
  groups,
}: KanbanTaskProps) {
  // Group tasks by group
  const tasksByGroup = useMemo(() => {
    return groupTasksByGroup(tasks);
  }, [tasks]);

  // Handle task drop within same list or between lists
  const handleTaskDrop = useCallback(
    (group: string, newTasks: TKanbanTask[], oldTasks: TKanbanTask[]) => {
      console.log("handleTaskDrop", group, newTasks, oldTasks);

      // Sort old tasks by sortOrder to get proper ordering
      const sortedOldTasks = [...oldTasks].sort((a, b) => {
        const aOrder = a.sortOrder || "";
        const bOrder = b.sortOrder || "";
        return aOrder.localeCompare(bOrder);
      });

      // Find tasks that were added (moved from another list)
      const addedTasks = newTasks.filter(
        (task) => !oldTasks.some((t) => t.id === task.id)
      );

      // Update group and sortOrder for tasks that were moved to this list
      if (addedTasks.length > 0) {
        // Find the insertion point: where the first added task is positioned
        const firstAddedIndex = newTasks.findIndex((task) =>
          addedTasks.some((at) => at.id === task.id)
        );
        const lastAddedIndex = firstAddedIndex + addedTasks.length - 1;

        // Get the previous task (before insertion point) and next task (after insertion point)
        const prevTask =
          firstAddedIndex > 0 ? newTasks[firstAddedIndex - 1] : null;
        const nextTask =
          lastAddedIndex < newTasks.length - 1
            ? newTasks[lastAddedIndex + 1]
            : null;

        // Generate sortOrders for all added tasks at once
        const prevSortOrder = prevTask?.sortOrder || undefined;
        const nextSortOrder = nextTask?.sortOrder || undefined;
        const newSortOrders = generateNBetweenKeys(
          prevSortOrder,
          nextSortOrder,
          addedTasks.length
        );

        // Update each added task with its generated sortOrder
        addedTasks.forEach((task, index) => {
          onTaskUpdate(task.id, {
            ...task,
            groupId: group,
            sortOrder: newSortOrders[index],
          });
        });
      }

      // Update sortOrder for tasks that were reordered within this list
      newTasks.forEach((task, index) => {
        const oldIndex = sortedOldTasks.findIndex((t) => t.id === task.id);
        if (oldIndex !== -1 && oldIndex !== index && task.groupId === group) {
          const prevTask = index > 0 ? newTasks[index - 1] : null;
          const nextTask =
            index < newTasks.length - 1 ? newTasks[index + 1] : null;

          // Generate sortOrder between previous and next task
          const prevSortOrder = prevTask?.sortOrder || undefined;
          const nextSortOrder = nextTask?.sortOrder || undefined;

          const newSortOrder = generateBetweenRank(
            prevSortOrder,
            nextSortOrder
          );

          onTaskUpdate(task.id, {
            ...task,
            sortOrder: newSortOrder,
          });
        }
      });
    },
    [onTaskUpdate]
  );

  // Handle task add
  const handleTaskAdd = useCallback(
    (groupId: string, taskData: TKanbanTask) => {
      // Get existing tasks for this group, sorted by sortOrder
      const groupTasks = tasks
        .filter((t) => t.groupId === groupId)
        .sort((a, b) => {
          const aOrder = a.sortOrder || "";
          const bOrder = b.sortOrder || "";
          return aOrder.localeCompare(bOrder);
        });

      // Generate sortOrder for new task (add at the end)
      const lastTask = groupTasks[groupTasks.length - 1];
      const lastSortOrder = lastTask?.sortOrder || undefined;
      const newSortOrder = generateBetweenRank(lastSortOrder, undefined);

      onTaskAdd(groupId, {
        ...taskData,
        sortOrder: newSortOrder,
      });
    },
    [onTaskAdd, tasks]
  );

  // Handle list reorder (group columns)
  const [groupOrderState, setGroupOrderState] = useState<GroupItem[]>(groups);

  const handleListReorder = useCallback((newOrder: GroupItem[]) => {
    setGroupOrderState(newOrder);
  }, []);

  // Update group order state when prop changes
  React.useEffect(() => {
    setGroupOrderState(groups);
  }, [groups]);

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
              const groupTasks = tasksByGroup[groupItem.id] || [];
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
