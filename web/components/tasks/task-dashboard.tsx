"use client";

import { ListFilter } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { PROJECT_TITLE_FALLBACK } from "@/lib/constant";
import { useGetProjects } from "@/service/local/api-project";
import {
  taskApi,
  useCreateTask,
  useDeleteTask,
  useGetTasks,
} from "@/service/local/api-task";

import { ProjectIcon } from "../projects/project-icon";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui";
import { Button } from "../ui/button";
import { DropdownFilter } from "../ui/drropdown-filter";
import { GroupItem, TaskKanban } from "./kanban/task-kanban";
import { TKanbanTask } from "./kanban/type";
import { TaskLoading } from "./task-loading";

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

export function TaskDashboard() {
  const [projectId, setProjectId] = useState<string>("");
  const { data: dexieTasks, isLoading } = useGetTasks({
    sortBy: "sortOrder",
    projectId: projectId,
  });

  const tasks: TKanbanTask[] = useMemo(() => {
    return dexieTasks.map((task) => ({
      ...task,
      groupId: task.status.toString(),
    }));
  }, [dexieTasks]);

  const [localTasks, setLocalTasks] = useState<TKanbanTask[]>([]);

  // Convert dexie tasks to local tasks
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

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
    setLocalTasks((prev) => [...prev, task]);
    createTask({
      ...task,
      status: task.status ?? (groupId ? Number(groupId) : undefined),
    });
  };

  const handleTaskUpdate = (id: string, task: Partial<TKanbanTask>) => {
    setLocalTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...task } : t))
    );
    taskApi.update({
      ...task,
      id,
      status: task.status ?? (task.groupId ? Number(task.groupId) : undefined),
    });
  };

  const handleTaskDelete = (id: string) => {
    console.log("handleTaskDelete", id);
    deleteTask(id);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <Collapsible key="note-filter-collapsible">
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Tasks</h1>
            <div className="flex items-center gap-0">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon">
                  <ListFilter />
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
          <CollapsibleContent>
            <div className="flex items-center py-2">
              <ProjectFilter value={projectId} onValueChange={setProjectId} />
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Content */}
      <div data-slot="content" className="flex-1 min-h-0">
        {isLoading ? (
          <TaskLoading />
        ) : (
          <TaskKanban
            tasks={localTasks}
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

function ProjectFilter({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) {
  const { data: projects } = useGetProjects();
  return (
    <DropdownFilter
      variant="secondary"
      className="rounded-full px-4"
      value={value}
      onValueChange={onValueChange}
      icon={<ProjectIcon />}
      size="sm"
      options={[
        {
          label: "All Projects",
          value: "",
        },
        ...(projects ?? []).map((project) => ({
          label: project.title || PROJECT_TITLE_FALLBACK,
          value: project.id,
        })),
      ]}
    />
  );
}
