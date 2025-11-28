"use client";

import { ListFilter } from "lucide-react";
import { useMemo, useState } from "react";

import { taskApi, useGetTasks } from "@/service/local/api-task";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui";
import { Button } from "../ui/button";
import { GroupItem, TaskKanban } from "./kanban/task-kanban";
import { TKanbanTask } from "./kanban/type";
import { TaskProjectFilter } from "./task-project-filter";

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
  const [projectId, setProjectId] = useState<string | undefined>();
  const { data: dexieTasks, isLoading } = useGetTasks({
    sortBy: "sortOrder",
    projectId: projectId ?? undefined,
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
          <div className="flex items-center gap-3">
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
            <div className="flex items-center gap-3 pt-2">
              <TaskProjectFilter value={projectId} onValueChange={setProjectId} />
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
