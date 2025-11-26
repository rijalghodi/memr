"use client";

import { ChevronDown } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { useIsMobile } from "@/hooks/use-mobile";
import { getCssColorStyle } from "@/lib/color";
import { useGetProjects } from "@/service/local/api-project";

import { CollectionIcon } from "../collections/collection-icon";
import { Button } from "../ui";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { TaskProjectPickerContent } from "./kanban/task-project-picker";
import { ProjectIcon } from "../projects/project-icon";

export function TaskProjectFilter({
  value,
  onValueChange,
}: {
  value: string | undefined;
  onValueChange: (value: string | undefined) => void;
}) {
  const { data: projects } = useGetProjects();
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const currentProject = useMemo(() => {
    return projects?.find((p) => p.id === value);
  }, [projects, value]);

  const handleChange = useCallback(
    (newProjectId: string | undefined) => {
      onValueChange(newProjectId);
    },
    [onValueChange]
  );

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="secondary"
            className="rounded-full"
            size={isMobile ? "sm" : "default"}
            style={getCssColorStyle(currentProject?.color ?? "")}
          >
            <ProjectIcon />
            {currentProject?.title || <span className="text-muted-foreground">Project</span>}
            <ChevronDown />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <TaskProjectPickerContent
            createOnEmpty={false}
            value={value}
            onChange={handleChange}
            onClose={() => setOpen(false)}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
