"use client";

import { ListFilter } from "lucide-react";
import { useMemo, useState } from "react";

import { PROJECT_TITLE_FALLBACK } from "@/lib/constant";
import { useGetProjects } from "@/service/local/api-project";
import { taskApi, useGetTasks } from "@/service/local/api-task";

import { ProjectIcon } from "../projects/project-icon";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui";
import { Button } from "../ui/button";
import { DropdownFilter } from "../ui/drropdown-filter";
import { GroupItem, TaskKanban } from "./kanban/task-kanban";
import { TKanbanTask } from "./kanban/type";

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

  const handleTaskAdd = (groupId: string, task: TKanbanTask) => {
    taskApi.create({
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
    console.log("handleTaskDelete", id);
    taskApi.delete(id);
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
