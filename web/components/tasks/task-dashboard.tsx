"use client";

import { Asterisk, ListFilter, Loader } from "lucide-react";
import { useMemo, useState } from "react";

import { PROJECT_TITLE_FALLBACK } from "@/lib/constant";
import { useGetProjects } from "@/service/local/api-project";
import {
  taskApi,
  useCreateTask,
  useDeleteTask,
  useGetTasks,
} from "@/service/local/api-task";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui";
import { Button } from "../ui/button";
import { DropdownFilter } from "../ui/drropdown-filter";
import { GroupItem, KanbanTask } from "./kanban/kanban";
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

  // Implement debounce upsert tasks

  const tasks: TKanbanTask[] = useMemo(() => {
    return dexieTasks.map((task) => ({
      ...task,
      groupId: task.status.toString(),
    }));
  }, [dexieTasks]);

  console.log("dexieTasks", dexieTasks);
  // console.log("tasks", tasks);

  // Task handlers
  const { mutate: createTask } = useCreateTask({
    onError: (error) => {
      console.error("Failed to create task:", error);
    },
  });

  // const { mutate: updateTask } = useUpdateTask({
  //   onError: (error) => {
  //     console.error("Failed to update task:", error);
  //   },
  // });

  const { mutate: deleteTask } = useDeleteTask({
    onError: (error) => {
      console.error("Failed to delete task:", error);
    },
  });

  const handleTaskAdd = (groupId: string, task: TKanbanTask) => {
    console.log("handleTaskAdd", groupId, task);
    const status = Number(groupId);
    createTask({
      title: task.title,
      description: task.description,
      status: status,
      sortOrder: task.sortOrder,
      dueDate: task.dueDate,
    });
  };

  const handleTaskUpdate = (id: string, task: Partial<TKanbanTask>) => {
    console.log("handleTaskUpdate", id, task);
    const status = Number(task.groupId);
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
    console.log("handleTaskDelete", id);
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
            <ProjectFilter value={projectId} onValueChange={setProjectId} />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Content */}
      <div data-slot="content" className="pb-6 px-6">
        {isLoading ? (
          <div className="h-[300px] text-center flex flex-col gap-4 items-center justify-center">
            <Loader className="size-6 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">
              Loading tasks...
            </span>
          </div>
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
      icon={<Asterisk />}
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
