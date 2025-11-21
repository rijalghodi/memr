import { cn } from "@/lib/utils";

import { Skeleton } from "../ui/skeleton";

export function NoteLoading() {
  return (
    <div>
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className={cn("px-6 border-b border-b-muted last:border-b-0")}
        >
          <div className="flex justify-between items-center py-6 gap-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-3 flex-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-64 col-start-2" />
            </div>

            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}
