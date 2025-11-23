import { ProjectIcon } from "@/components/projects/project-icon";
import { Button } from "@/components/ui/button";
import { DropdownFilter } from "@/components/ui/drropdown-filter";
import { PROJECT_TITLE_FALLBACK } from "@/lib/constant";
import { cn } from "@/lib/utils";
import { useGetProjects } from "@/service/local/api-project";

export type ProjectSelectorProps = {
  selectedProjectId?: string;
  onSelect?: (projectId: string | undefined) => void;
  disabled?: boolean;
  className?: string;
};

export const ProjectSelector = ({
  selectedProjectId,
  onSelect,
  disabled,
  className,
}: ProjectSelectorProps) => {
  const { data: projects, isLoading } = useGetProjects();

  return (
    <DropdownFilter
      value={selectedProjectId}
      onValueChange={onSelect}
      className={className}
      options={[
        {
          label: (
            <span className="flex items-center gap-1">
              <ProjectIcon
                className="size-3"
                style={{ color: "var(--muted-foreground)" }}
              />
              <span>No Project</span>
            </span>
          ),
          value: "",
        },
        ...(projects ?? []).map((project) => ({
          label: (
            <span className="flex items-center gap-1">
              <ProjectIcon
                className="size-3"
                style={{ color: project.color }}
              />
              <span>{project.title || PROJECT_TITLE_FALLBACK}</span>
            </span>
          ),
          value: project.id,
        })),
      ]}
    >
      {(value, label) =>
        value ? (
          <button
            className={cn(
              "text-xs font-medium text-muted-foreground px-1 h-7 leading-none rounded-sm hover:bg-accent flex items-center gap-1",
            )}
          >
            {label}
          </button>
        ) : (
          <Button variant="ghost" size="icon-sm" className="rounded-full">
            <ProjectIcon />
          </Button>
        )
      }
    </DropdownFilter>
  );
};
