import { formatDate } from "date-fns";
import { ArrowUp, CalendarIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";

import { ProjectSelector } from "./project-selector";
import { TKanbanTask } from "./type";

type Props = {
  onSubmit?: (
    data: Pick<TKanbanTask, "title" | "dueDate" | "projectId">,
  ) => void;
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
          "field-sizing-content bg-transparent dark:bg-transparent focus-visible:ring-0",
        )}
        value={data.title}
        onChange={(e) => setData({ ...data, title: e.target.value })}
        autoFocus={true}
      />

      <div className="flex items-center justify-between mt-2">
        <div className="flex space-x-0 items-center">
          <DatePicker
            date={data.dueDate}
            onSelect={(date) => setData({ ...data, dueDate: date })}
          >
            {(date) =>
              date ? (
                <button className="text-xs font-medium text-primary px-1 h-7 leading-none rounded-sm hover:bg-accent">
                  {formatDate(date, "MMM d, yyyy")}
                </button>
              ) : (
                <Button size="icon-sm" variant="ghost" className="rounded-full">
                  <CalendarIcon className="size-3.5" />
                </Button>
              )
            }
          </DatePicker>
          <ProjectSelector
            selectedProjectId={data.projectId}
            onSelect={(projectId) => setData({ ...data, projectId })}
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
