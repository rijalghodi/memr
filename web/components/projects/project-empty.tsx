import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import { ProjectIcon } from "./project-icon";

type ProjectEmptyProps = {
  onAddProject: () => void;
};

export function ProjectEmpty({ onAddProject }: ProjectEmptyProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ProjectIcon />
        </EmptyMedia>
        <EmptyTitle>No Projects</EmptyTitle>
        <EmptyDescription>You haven&apos;t created any projects yet</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Button className="rounded-full" onClick={onAddProject}>
            Create Project
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}
