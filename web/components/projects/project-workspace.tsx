"use client";

import React, { useMemo } from "react";

import { PROJECT_TITLE_FALLBACK } from "@/lib/constant";
import { projectApi, useGetProject } from "@/service/local/api-project";
import { taskApi, useCreateTask, useDeleteTask, useGetTasks } from "@/service/local/api-task";

import { GroupItem, TaskKanban } from "../tasks/kanban/task-kanban";
import { TKanbanTask } from "../tasks/kanban/type";
import { Collapsible, CollapsibleContent } from "../ui";
import { ProjectIcon } from "./project-icon";

const statusGroupItems: GroupItem[] = [
  {
    id: "0",
    title: "To Do",
  },
  {
    id: "1",
    title: "In Progress",
  },
  {
    id: "2",
    title: "Done",
  },
  {
    id: "-1",
    title: "Cancelled",
  },
];

export function ProjectWorkspace({ projectId }: { projectId: string }) {
  const { data: project } = useGetProject(projectId);
  const { data: dexieTasks, isLoading } = useGetTasks({
    sortBy: "sortOrder",
    projectId: projectId,
  });

  const projectTitle = useMemo(() => project?.title || "", [project]);

  const tasks: TKanbanTask[] = useMemo(() => {
    return dexieTasks.map((task) => ({
      ...task,
      groupId: task.status.toString(),
    }));
  }, [dexieTasks]);

  // Task handlers
  const { mutate: createTask } = useCreateTask({
    onError: (error) => {
      console.error("Failed to create task:", error);
    },
  });

  const { mutate: deleteTask } = useDeleteTask({
    onError: (error) => {
      console.error("Failed to delete task:", error);
    },
  });

  const handleTaskAdd = (groupId: string, task: TKanbanTask) => {
    createTask({
      ...task,
      status: task.status ?? (groupId ? Number(groupId) : undefined),
    });
  };

  const handleTaskUpdate = (id: string, task: Partial<TKanbanTask>) => {
    taskApi.update({
      ...task,
      id,
      status: task.status ?? (task.groupId ? Number(task.groupId) : undefined),
    });
  };

  const handleTaskDelete = (id: string) => {
    deleteTask(id);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    projectApi.update({
      id: projectId,
      title: e.target.value,
    });
  };

  const handleTitleBlur = () => {
    projectApi.update({
      id: projectId,
      title: projectTitle,
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <Collapsible key="project-filter-collapsible">
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ProjectIcon
                className="size-5 md:size-6 shrink-0"
                style={{ color: project?.color }}
              />
              <input
                className="text-2xl md:text-3xl font-semibold focus:outline-none focus:ring-0 p-2 focus:bg-muted rounded-md w-full max-w-[300px]"
                placeholder={PROJECT_TITLE_FALLBACK}
                value={projectTitle}
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.currentTarget.blur();
                  }
                }}
              />
            </div>
            <div className="flex items-center gap-0">
              {/* <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon">
                  <ListFilter />
                </Button>
              </CollapsibleTrigger> */}
            </div>
          </div>
          <CollapsibleContent>
            <div className="flex items-center">{/* Filters can be added here if needed */}</div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Content */}
      <div
        data-slot="content"
        className="flex-1 w-full min-h-0 animate-in fade-in slide-in-from-bottom-3 duration-500"
      >
        {isLoading ? null : (
          <TaskKanban
            tasks={tasks}
            onTaskAdd={handleTaskAdd}
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={handleTaskDelete}
            groups={statusGroupItems}
            defaultProjectId={projectId}
          />
        )}
      </div>
    </div>
  );
}
