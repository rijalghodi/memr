"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { ReactSortable } from "react-sortablejs";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { TASK_TITLE_FALLBACK } from "@/lib/constant";
import { Task } from "@/lib/dexie";
import { useGetTasks, useUpdateTask } from "@/service/local/api-task";

// Status mapping: numeric status to display label
const STATUS_MAP: Record<number, string> = {
  0: "Not Started",
  1: "In Progress",
  2: "Completed",
  [-1]: "Deferred",
};

// Status order for kanban columns
const TASK_STATUSES: number[] = [0, 1, 2, -1];

// Status item for list reordering (ReactSortable requires objects with id)
type StatusItem = { id: number; status: number };

// Helper function to get status label
function getStatusLabel(status: number): string {
  return STATUS_MAP[status] || "Unknown";
}

// Helper function to group tasks by status
function groupTasksByStatus(tasks: Task[]): Record<number, Task[]> {
  return tasks.reduce(
    (acc, task) => {
      if (!acc[task.status]) {
        acc[task.status] = [];
      }
      acc[task.status].push(task);
      return acc;
    },
    {} as Record<number, Task[]>,
  );
}

// Card component
const Card: React.FC<{ task: Task }> = ({ task }) => (
  <div className="bg-card border border-border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-move">
    <div className="text-sm font-medium text-foreground line-clamp-2 mb-2">
      {task.title || TASK_TITLE_FALLBACK}
    </div>
    {task.description && (
      <div className="text-xs text-muted-foreground line-clamp-2">
        {task.description}
      </div>
    )}
  </div>
);

// List component
const List: React.FC<{
  status: number;
  tasks: Task[];
  onTaskDrop: (status: number, newTasks: Task[], oldTasks: Task[]) => void;
}> = ({ status, tasks, onTaskDrop }) => {
  const statusLabel = getStatusLabel(status);
  const previousTasksRef = useRef<Task[]>(tasks);

  const handleSetList = useCallback(
    (newTasks: Task[]) => {
      const oldTasks = previousTasksRef.current;
      onTaskDrop(status, newTasks, oldTasks);
      previousTasksRef.current = newTasks;
    },
    [status, onTaskDrop],
  );

  // Update ref when tasks change from external source
  React.useEffect(() => {
    previousTasksRef.current = tasks;
  }, [tasks]);

  return (
    <div className="flex flex-col h-full min-w-[280px] bg-muted/30 rounded-lg border border-border">
      <div className="px-4 py-3 border-b border-border cursor-move list-title">
        <h3 className="text-sm font-semibold text-foreground">{statusLabel}</h3>
        <span className="text-xs text-muted-foreground">
          {tasks.length} tasks
        </span>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3">
          <ReactSortable
            list={tasks}
            setList={handleSetList}
            group="kanban-tasks"
            animation={200}
            className="space-y-2 min-h-[100px]"
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
export function KanbanDemo() {
  const { data: allTasks, isLoading } = useGetTasks();
  const { mutate: updateTask } = useUpdateTask({
    onError: (error) => {
      console.error("Failed to update task:", error);
    },
  });

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    return groupTasksByStatus(allTasks);
  }, [allTasks]);

  // Handle task drop within same list or between lists
  const handleTaskDrop = useCallback(
    (status: number, newTasks: Task[], oldTasks: Task[]) => {
      // Find tasks that were added (moved from another list)
      const addedTasks = newTasks.filter(
        (task) => !oldTasks.some((t) => t.id === task.id),
      );

      // Update status for tasks that were moved to this list
      addedTasks.forEach((task) => {
        if (task.status !== status) {
          updateTask({
            id: task.id,
            status: status,
            sortOrder: newTasks.indexOf(task).toString(),
          });
        }
      });

      // Update sortOrder for tasks that were reordered within this list
      newTasks.forEach((task, index) => {
        const oldIndex = oldTasks.findIndex((t) => t.id === task.id);
        if (oldIndex !== -1 && oldIndex !== index && task.status === status) {
          updateTask({
            id: task.id,
            sortOrder: index.toString(),
          });
        }
      });
    },
    [updateTask],
  );

  // Handle list reorder (status columns)
  const [statusOrder, setStatusOrder] = useState<StatusItem[]>(() =>
    TASK_STATUSES.map((status) => ({ id: status, status })),
  );

  const handleListReorder = useCallback((newOrder: StatusItem[]) => {
    setStatusOrder(newOrder);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-sm text-muted-foreground">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div id="kanban" className="h-full w-full flex flex-col">
      <ScrollArea className="flex-1 w-full">
        <div className="p-4 h-full">
          <ReactSortable
            list={statusOrder}
            setList={handleListReorder}
            animation={200}
            handle=".list-title"
            direction="horizontal"
            className="flex gap-4 h-full"
          >
            {statusOrder.map((statusItem) => {
              const tasks = tasksByStatus[statusItem.status] || [];
              return (
                <List
                  key={statusItem.status}
                  status={statusItem.status}
                  tasks={tasks}
                  onTaskDrop={handleTaskDrop}
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
