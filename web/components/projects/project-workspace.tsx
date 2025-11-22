"use client";

import { Loader } from "lucide-react";
import React, { useMemo } from "react";

import { PROJECT_TITLE_FALLBACK } from "@/lib/constant";
import { projectApi, useGetProject } from "@/service/local/api-project";
import {
  taskApi,
  useCreateTask,
  useDeleteTask,
  useGetTasks,
} from "@/service/local/api-task";

import { GroupItem, KanbanTask } from "../tasks/kanban/kanban";
import { TKanbanTask } from "../tasks/kanban/type";
import { Collapsible, CollapsibleContent } from "../ui";
import { ProjectIcon } from "./project-icon";
import { TaskLoading } from "../tasks/task-loading";

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
    const status = groupId ? Number(groupId) : undefined;
    createTask({
      projectId: projectId,
      title: task.title,
      description: task.description,
      status: status,
      sortOrder: task.sortOrder,
      dueDate: task.dueDate,
    });
  };

  const handleTaskUpdate = (id: string, task: Partial<TKanbanTask>) => {
    const status = task.groupId ? Number(task.groupId) : undefined;
    taskApi.update({
      id,
      title: task.title,
      description: task.description,
      status: status,
      sortOrder: task.sortOrder,
      dueDate: task.dueDate,
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
    <div className="pt-4 space-y-4">
      {/* Header */}
      <Collapsible key="project-filter-collapsible">
        <div className="px-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ProjectIcon
                className="size-8"
                style={{ color: project?.color }}
              />
              <input
                className="text-3xl font-semibold focus:outline-none focus:ring-0 p-2 focus:bg-muted rounded-md"
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
            <div className="flex items-center">
              {/* Filters can be added here if needed */}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Content */}
      <div data-slot="content" className="flex-1 overflow-hidden h-full">
        {isLoading ? (
          <TaskLoading />
        ) : (
          <KanbanTask
            tasks={tasks}
            onTaskAdd={handleTaskAdd}
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={handleTaskDelete}
            groups={statusGroupItems}
          />
        )}
      </div>
    </div>
  );
}
