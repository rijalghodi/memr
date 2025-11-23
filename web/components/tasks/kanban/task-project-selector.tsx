import { ProjectIcon } from "@/components/projects/project-icon";
import { Button } from "@/components/ui/button";
import { DropdownFilter } from "@/components/ui/drropdown-filter";
import { PROJECT_TITLE_FALLBACK } from "@/lib/constant";
import { useGetProjects } from "@/service/local/api-project";

export type Props = {
  value?: string;
  onChange?: (projectId: string | undefined) => void;
  disabled?: boolean;
  className?: string;
};

export const TaskProjectSelector = ({
  value: value,
  onChange: onChange,
  disabled,
  className,
}: Props) => {
  const { data: projects, isLoading } = useGetProjects();

  return (
    <DropdownFilter
      value={value}
      onValueChange={onChange}
      className={className}
      disabled={disabled}
      loading={isLoading}
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
      {(value, label) => (
        <Button variant="ghost" size="sm-compact">
          {value ? label : <ProjectIcon />}
        </Button>
      )}
    </DropdownFilter>
  );
};
