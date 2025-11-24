import { Skeleton } from "../ui/skeleton";

export function ProjectLoading() {
  return null;
  return (
    <ul className="flex flex-col">
      {Array.from({ length: 4 }).map((_, index) => (
        <li key={index} className="px-6 border-b border-b-muted last:border-b-0">
          <div className="flex justify-between items-center py-6 gap-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-16" />
          </div>
        </li>
      ))}
    </ul>
  );
}
