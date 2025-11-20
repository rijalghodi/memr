"use client";

import { ArrowDownUp, ListFilter, Loader } from "lucide-react";
import { useState } from "react";

import type { Task } from "@/lib/dexie";
import {
  useCreateTask,
  useDeleteTask,
  useGetTasks,
  useUpdateTask,
} from "@/service/local/api-task";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui";
import { Button } from "../ui/button";
import { DropdownFilter } from "../ui/drropdown-filter";
import { TaskKanban } from "./task-kanban";

type Props = {};

type SortByValue = "updatedAt" | "viewedAt" | "createdAt";

export function TaskDashboard({}: Props) {
  const [sortBy, setSortBy] = useState<SortByValue>("updatedAt");
  const { data: dexieTasks, isLoading } = useGetTasks({ sortBy });

  const handleSortChange = (value: string) => {
    setSortBy(value as SortByValue);
  };

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

  const handleTaskAdd = (
    task: Omit<Task, "id" | "createdAt" | "updatedAt">,
  ) => {
    createTask({
      title: task.title,
      description: task.description,
      status: task.status,
      sortOrder: task.sortOrder,
      dueDate: task.dueDate,
      projectId: task.projectId,
    });
  };

  const handleTaskUpdate = (id: string, task: Partial<Task>) => {
    updateTask({
      id,
      title: task.title,
      description: task.description,
      status: task.status,
      sortOrder: task.sortOrder,
      dueDate: task.dueDate,
      projectId: task.projectId,
    });
  };

  const handleTaskDelete = (id: string) => {
    deleteTask(id);
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
          <TaskKanban
            tasks={dexieTasks}
            onAddTask={handleTaskAdd}
            onUpdateTask={handleTaskUpdate}
            onDeleteTask={handleTaskDelete}
          />
        )}
      </div>
    </div>
  );
}
