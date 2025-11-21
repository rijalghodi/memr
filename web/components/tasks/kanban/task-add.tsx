import { ArrowUp, Calendar1, FolderInput } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { TKanbanTask } from "./type";

type Props = {
  onSubmit?: (
    data: Pick<TKanbanTask, "title" | "dueDate" | "description">,
  ) => void;
};

// TaskBox component is a task item after created
export function TaskAdd({ onSubmit }: Props) {
  const [title, setTitle] = useState("");
  return (
    <>
      <form
        className="relative z-1 flex flex-col border rounded-md p-2 pb-1.5 focus-within:border-primary w-full"
        onSubmit={(e) => {
          e.preventDefault();
          if (onSubmit) {
            onSubmit({ title, dueDate: "" });
            setTitle("");
          }
        }}
      >
        {/* TODO: Title input */}
        <input
          placeholder="What would you like to do?"
          className="bg-transparent outline-none placeholder-placeholder text-sm w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus={true}
        />

        {/* Action Buttons Start*/}
        <div className="flex items-center justify-between mt-2">
          <div className="flex space-x-0">
            <Button variant="ghost" size="icon-sm" className="rounded-full">
              <Calendar1 />
            </Button>
            <Button variant="ghost" size="icon-sm" className="rounded-full">
              <FolderInput />
            </Button>
          </div>
          <div>
            <Button
              size="icon-sm"
              type="submit"
              className="rounded-full"
              disabled={!title}
            >
              <ArrowUp />
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
