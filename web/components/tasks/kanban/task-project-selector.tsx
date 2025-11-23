import { X } from "lucide-react";
import { useMemo } from "react";

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

  const options = useMemo(() => {
    const opts = [];
    if (value) {
      opts.push({
        label: (
          <span className="flex items-center gap-1">
            <X className="size-4 text-muted-foreground" />
            <span className="text-ellipsis line-clamp-1">Remove</span>
          </span>
        ),
        value: "",
      });
    }
    opts.push(
      ...(projects ?? []).map((project) => ({
        label: (
          <span className="flex items-center gap-1">
            <ProjectIcon className="size-4" style={{ color: project.color }} />
            <span className="text-ellipsis line-clamp-1">
              {project.title || PROJECT_TITLE_FALLBACK}
            </span>
          </span>
        ),
        value: project.id,
      })),
    );
    return opts;
  }, [value, projects]);

  return (
    <DropdownFilter
      value={value}
      onValueChange={onChange}
      className={className}
      disabled={disabled}
      loading={isLoading}
      side="bottom"
      align="start"
      options={options}
    >
      {(value, label) => (
        <Button variant="ghost" size="sm-compact" className="font-normal">
          {value ? label : <ProjectIcon />}
        </Button>
      )}
    </DropdownFilter>
  );
};
