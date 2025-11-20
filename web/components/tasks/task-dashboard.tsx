"use client";

import { ArrowDownUp, ListFilter, Loader } from "lucide-react";
import { useMemo, useState } from "react";

import {
  useCreateTask,
  useDeleteTask,
  useGetTasks,
  useUpdateTask,
} from "@/service/local/api-task";

import { Kanban, type Task as KanbanTask } from "../kanban/kanban";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui";
import { Button } from "../ui/button";
import { DropdownFilter } from "../ui/drropdown-filter";

type Props = {};

type SortByValue = "updatedAt" | "viewedAt" | "createdAt";

// Status to group title mapping
const STATUS_TO_GROUP: Record<number, string> = {
  0: "To Do",
  1: "In Progress",
  2: "Done",
  [-1]: "Cancelled",
};

const GROUP_TO_STATUS: Record<string, number> = {
  "To Do": 0,
  "In Progress": 1,
  Done: 2,
  Cancelled: -1,
};

export function TaskDashboard({}: Props) {
  const [sortBy, setSortBy] = useState<SortByValue>("updatedAt");
  const { data: dexieTasks, isLoading } = useGetTasks({ sortBy });

  const handleSortChange = (value: string) => {
    setSortBy(value as SortByValue);
  };

  // Convert dexie tasks to kanban tasks
  const kanbanTasks = useMemo<KanbanTask[]>(() => {
    return dexieTasks.map((task) => ({
      id: task.id,
      group: STATUS_TO_GROUP[task.status] || "To Do",
      title: task.title || "",
      description: task.description,
      status: task.status,
      sortOrder: task.sortOrder,
      dueDate: task.dueDate,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      deletedAt: task.deletedAt,
      syncedAt: task.syncedAt,
    }));
  }, [dexieTasks]);

  // Task handlers
  const { mutate: createTask } = useCreateTask({
    onError: (error) => {
      console.error("Failed to create task:", error);
    },
  });

  const { mutate: updateTask } = useUpdateTask({
    onError: (error) => {
      console.error("Failed to update task:", error);
    },
  });

  const { mutate: deleteTask } = useDeleteTask({
    onError: (error) => {
      console.error("Failed to delete task:", error);
    },
  });

  const handleTaskAdd = (kanbanTask: KanbanTask) => {
    const status = GROUP_TO_STATUS[kanbanTask.group] ?? 0;
    createTask({
      title: kanbanTask.title,
      description: kanbanTask.description,
      status: status,
      sortOrder: kanbanTask.sortOrder?.toString(),
      dueDate: kanbanTask.dueDate,
    });
  };

  const handleTaskUpdate = (kanbanTask: KanbanTask) => {
    const status = GROUP_TO_STATUS[kanbanTask.group] ?? 0;
    updateTask({
      id: kanbanTask.id,
      title: kanbanTask.title,
      description: kanbanTask.description,
      status: status,
      sortOrder: kanbanTask.sortOrder?.toString(),
      dueDate: kanbanTask.dueDate,
    });
  };

  const handleTaskDelete = (kanbanTask: KanbanTask) => {
    deleteTask(kanbanTask.id);
  };

  return (
    <div>
      {/* Header */}
      <Collapsible key="note-filter-collapsible">
        <div className="flex items-center justify-between px-6 pt-6 pb-3">
          <h1 className="text-3xl font-semibold">Tasks</h1>
          <div className="flex items-center gap-0">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon">
                <ListFilter />
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>
        <CollapsibleContent>
          <div className="px-6 flex items-center pb-3">
            <DropdownFilter
              variant="secondary"
              className="rounded-full px-4"
              value={sortBy}
              onValueChange={handleSortChange}
              icon={<ArrowDownUp />}
              options={[
                {
                  label: "Last Updated",
                  value: "updatedAt",
                },
                {
                  label: "Last Viewed",
                  value: "viewedAt",
                },
                {
                  label: "Created",
                  value: "createdAt",
                },
              ]}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
      {/* Content */}
      <div data-slot="content" className="pb-6">
        {isLoading ? (
          <div className="p-6 h-[300px] text-center flex flex-col gap-4 items-center justify-center">
            <Loader className="size-6 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">
              Loading tasks...
            </span>
          </div>
        ) : (
          <div className="flex flex-col">
            <Kanban
              tasks={kanbanTasks}
              onTaskUpdate={handleTaskUpdate}
              onTaskAdd={handleTaskAdd}
              onTaskDelete={handleTaskDelete}
              groupOrder={[
                { id: 0, title: "To Do" },
                { id: 1, title: "In Progress" },
                { id: 2, title: "Done" },
                { id: -1, title: "Cancelled" },
              ]}
            />
          </div>
        )}
      </div>
    </div>
  );
}
