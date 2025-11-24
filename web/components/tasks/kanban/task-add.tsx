import { isToday } from "date-fns";
import { ArrowUp } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { TaskDatePicker } from "./task-date-picker";
import { TaskProjectPicker } from "./task-project-picker";
import { TKanbanTask } from "./type";

type Props = {
  onSubmit?: (data: Pick<TKanbanTask, "title" | "dueDate" | "projectId">) => void;
};

export function TaskAdd({ onSubmit }: Props) {
  const [data, setData] = useState<{
    title: string;
    dueDate?: Date;
    projectId?: string;
  }>({
    title: "",
  });

  return (
    <form
      className="relative z-1 flex flex-col border rounded-md p-2 pb-1.5 focus-within:border-primary w-full"
      onSubmit={(e) => {
        e.preventDefault();
        console.log("handle submit", data);
        if (onSubmit) {
          onSubmit({
            title: data.title,
            dueDate: data.dueDate?.toISOString() ?? undefined,
            projectId: data.projectId ?? undefined,
          });
          setData({
            title: "",
            dueDate: undefined,
            projectId: undefined,
          });
        }
      }}
    >
      <input
        placeholder="What would you like to do?"
        className={cn(
          "text-sm w-full resize-none rounded-none border-none px-1 py-1 pb-0 shadow-none outline-none ring-0",
          "field-sizing-content bg-transparent dark:bg-transparent focus-visible:ring-0"
        )}
        value={data.title}
        onChange={(e) => setData({ ...data, title: e.target.value })}
        autoFocus={true}
      />

      <div className="flex items-center justify-between mt-2">
        <div className="flex space-x-2 items-center">
          <TaskDatePicker
            value={data.dueDate}
            onChange={(date) => setData({ ...data, dueDate: date })}
            isOverdue={(date) => date && !isToday(new Date(date)) && new Date(date) < new Date()}
          />
          <TaskProjectPicker
            value={data.projectId}
            onChange={(projectId) => setData({ ...data, projectId })}
          />
        </div>
        <div>
          <Button
            size="icon-sm"
            type="submit"
            className="rounded-full"
            disabled={!data.title.trim()}
          >
            <ArrowUp />
          </Button>
        </div>
      </div>
    </form>
  );
}
