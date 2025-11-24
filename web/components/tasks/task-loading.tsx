import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import { Skeleton } from "../ui/skeleton";

export function TaskLoading() {
  return null;
  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <div className="flex gap-0 h-full flex-1 px-6 overflow-x-auto">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex flex-col h-full w-full max-w-[280px] rounded-lg">
            {/* Header skeleton */}
            <header className="px-2 space-y-1 py-2">
              <Skeleton className="h-4 w-16" />
            </header>

            {/* Tasks skeleton */}
            <ScrollArea className="flex-1 flex items-stretch overflow-y-auto">
              <div className="space-y-3 pb-2 px-2 h-full min-h-[400px]">
                {Array.from({ length: 3 }).map((_, taskIndex) => (
                  <div
                    key={taskIndex}
                    className="bg-card border border-border rounded-sm px-3 py-3 space-y-1"
                  >
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                ))}
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </div>
        ))}
      </div>
    </div>
  );
}
