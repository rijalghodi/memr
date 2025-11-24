import { Check, Plus, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { ProjectIcon } from "@/components/projects/project-icon";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { getRandomColor } from "@/lib/color";
import { PROJECT_TITLE_FALLBACK } from "@/lib/constant";
import { cn } from "@/lib/utils";
import { useCreateProject, useGetProjects } from "@/service/local/api-project";

export type Props = {
  value?: string;
  onChange?: (projectId: string | undefined) => void;
  disabled?: boolean;
};

export const TaskProjectPicker = ({ value: value, onChange: onChange, disabled }: Props) => {
  const [open, setOpen] = useState(false);
  const { data: projects } = useGetProjects();

  const selectedProject = useMemo(() => {
    return projects?.find((p) => p.id === value);
  }, [projects, value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          role="combobox"
          aria-expanded={open}
          variant="ghost"
          size="sm-compact"
          disabled={disabled}
        >
          {selectedProject ? (
            <span className="flex items-center gap-1">
              <ProjectIcon className="size-4" style={{ color: selectedProject.color }} />
              <span className="text-ellipsis line-clamp-1">
                {selectedProject.title || PROJECT_TITLE_FALLBACK}
              </span>
            </span>
          ) : (
            <ProjectIcon className="size-4" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <TaskProjectPickerContent
          value={value}
          onChange={onChange}
          onClose={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
};

export type TaskProjectPickerContentProps = {
  value?: string;
  onChange?: (projectId: string | undefined) => void;
  onClose?: () => void;
};

export const TaskProjectPickerContent = ({
  value,
  onChange: onChange,
  onClose,
}: TaskProjectPickerContentProps) => {
  const [search, setSearch] = useState("");
  const { data: projects, isLoading } = useGetProjects();

  const handleCreateSuccess = useCallback(
    (newProject: { id: string }) => {
      onChange?.(newProject.id);
      onClose?.();
      setSearch("");
    },
    [onChange, onClose]
  );

  const { mutate: createProject, isLoading: isCreating } = useCreateProject({
    onSuccess: handleCreateSuccess,
  });

  const filteredProjects = useMemo(() => {
    if (!search.trim()) {
      return projects ?? [];
    }
    const searchLower = search.toLowerCase();
    return (
      projects?.filter((project) =>
        (project.title || PROJECT_TITLE_FALLBACK).toLowerCase().includes(searchLower)
      ) ?? []
    );
  }, [projects, search]);

  const handleSelect = (projectId: string) => {
    if (projectId === "") {
      onChange?.(undefined);
    } else {
      const newValue = projectId === value ? undefined : projectId;
      onChange?.(newValue);
    }
    onClose?.();
    setSearch("");
  };

  const handleCreateProject = () => {
    if (search.trim()) {
      createProject({
        title: search.trim(),
        color: getRandomColor(),
      });
    }
  };

  return (
    <Command shouldFilter={false}>
      <CommandInput placeholder="Search projects..." value={search} onValueChange={setSearch} />
      <CommandList>
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <Spinner />
          </div>
        ) : (
          <>
            {filteredProjects.length > 0 && (
              <CommandGroup>
                {value && (
                  <CommandItem value="remove" onSelect={() => handleSelect("")}>
                    <X className="size-4" />
                    <span>Remove project</span>
                  </CommandItem>
                )}
                {filteredProjects.map((project) => (
                  <CommandItem
                    key={project.id}
                    value={project.id}
                    onSelect={() => handleSelect(project.id)}
                  >
                    <ProjectIcon className="size-4" style={{ color: project.color }} />
                    <span className="text-ellipsis line-clamp-1">
                      {project.title || PROJECT_TITLE_FALLBACK}
                    </span>
                    <Check
                      className={cn(
                        "ml-auto size-4",
                        value === project.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            <CommandSeparator />
            <CommandGroup>
              <CommandItem onSelect={handleCreateProject} disabled={isCreating}>
                <Plus />
                <span>Create project &quot;{search.trim()}&quot;</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </Command>
  );
};
