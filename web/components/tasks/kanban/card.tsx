import React from "react";

import { TASK_TITLE_FALLBACK } from "@/lib/constant";

import type { TKanbanTask } from "./type";

// Card component
export function Card({ task }: { task: TKanbanTask }) {
  return (
    <div className="bg-card border border-border rounded-sm px-3 py-3 space-y-1 hover:bg-muted transition-colors cursor-move">
      <div className="text-sm font-medium text-foreground line-clamp-2 font-mono">
        {task.title || TASK_TITLE_FALLBACK} {task.sortOrder}
      </div>
      {task.description && (
        <div className="text-xs text-muted-foreground line-clamp-1 leading-none">
          {task.description}
        </div>
      )}
    </div>
  );
}
