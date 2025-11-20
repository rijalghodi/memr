"use client";

import { ArrowDownUp, ListFilter, Loader } from "lucide-react";
import { useMemo, useState } from "react";

import {
  useCreateTask,
  useDeleteTask,
  useGetTasks,
  useUpdateTask,
} from "@/service/local/api-task";

import { Kanban, type Task as KanbanTask, GroupItem } from "../kanban/kanban";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui";
import { Button } from "../ui/button";
import { DropdownFilter } from "../ui/drropdown-filter";
import { Task } from "@/lib/dexie";

type Props = {
  tasks: Task[];
  onAddTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  onUpdateTask: (id: string, task: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
};

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

type GroupByValue = "status" | "date";

const statusGroupOrder: GroupItem[] = [
  { id: "0", title: "To Do" },
  { id: "1", title: "In Progress" },
  { id: "2", title: "Done" },
  { id: "-1", title: "Cancelled" },
];

export function TaskKanban({
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}: Props) {
  // Convert dexie tasks to kanban tasks
  const kanbanTasks = useMemo<KanbanTask[]>(() => {
    return tasks.map((task) => ({
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
  }, [tasks]);

  const handleTaskAdd = (
    group: string,
    data: Pick<Task, "title" | "dueDate" | "description">
  ) => {
    // const status = GROUP_TO_STATUS[group] ?? 0;
    console.log("group", group);
    const status = Number(group);
    onAddTask({
      title: data.title,
      description: data.description,
      status: status,
      dueDate: data.dueDate,
    });
  };

  const handleTaskUpdate = (kanbanTask: KanbanTask) => {
    const group = kanbanTask.group;
    const status = GROUP_TO_STATUS[group] ?? 0;
    const dueDate = kanbanTask.dueDate;
    onUpdateTask(kanbanTask.id, {
      title: kanbanTask.title,
      description: kanbanTask.description,
      status: status,
      sortOrder: kanbanTask.sortOrder?.toString(),
      dueDate: kanbanTask.dueDate,
    });
  };

  const handleTaskDelete = (kanbanTask: KanbanTask) => {
    onDeleteTask(kanbanTask.id);
  };

  return (
    <div data-slot="content" className="pb-6 px-6">
      <Kanban
        tasks={kanbanTasks}
        onTaskUpdate={handleTaskUpdate}
        onTaskAdd={handleTaskAdd}
        onTaskDelete={handleTaskDelete}
        groupOrder={statusGroupOrder}
      />
    </div>
  );
}
