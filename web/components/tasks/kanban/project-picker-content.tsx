import { X } from "lucide-react";

import { ProjectIcon } from "@/components/projects/project-icon";
import {
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { PROJECT_TITLE_FALLBACK } from "@/lib/constant";
import { useGetProjects } from "@/service/local/api-project";

export type ProjectPickerContentProps = {
  value?: string;
  onSelect?: (projectId: string | undefined) => void;
  onClose?: () => void;
};

export const ProjectPickerContent = ({
  value,
  onSelect,
  onClose,
}: ProjectPickerContentProps) => {
  const { data: projects, isLoading } = useGetProjects();

  const handleSelect = (projectId: string) => {
    if (projectId === "") {
      // Remove project
      onSelect?.(undefined);
    } else {
      // Select project
      onSelect?.(projectId);
    }
    onClose?.();
  };

  if (isLoading) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Loading projects...
      </div>
    );
  }

  if (projects?.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        You have no projects
      </div>
    );
  }

  return (
    <DropdownMenuRadioGroup value={value} onValueChange={handleSelect}>
      {value && (
        <DropdownMenuRadioItem value="">
          <span className="flex items-center gap-2">
            <X className="size-4" />
            <span>Remove project</span>
          </span>
        </DropdownMenuRadioItem>
      )}
      {projects?.map((project) => (
        <DropdownMenuRadioItem key={project.id} value={project.id}>
          <span className="flex items-center gap-2">
            <ProjectIcon className="size-4" style={{ color: project.color }} />
            <span>{project.title || PROJECT_TITLE_FALLBACK}</span>
          </span>
        </DropdownMenuRadioItem>
      ))}
    </DropdownMenuRadioGroup>
  );
};
