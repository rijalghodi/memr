import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";

import { ProjectIcon } from "@/components/projects/project-icon";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { PROJECT_TITLE_FALLBACK } from "@/lib/constant";
import { getRandomColor } from "@/lib/random-color";
import { cn } from "@/lib/utils";
import { useCreateProject, useGetProjects } from "@/service/local/api-project";

export type Props = {
  value?: string;
  onChange?: (projectId: string | undefined) => void;
  disabled?: boolean;
};

export const TaskProjectSelector = ({
  value: value,
  onChange: onChange,
  disabled,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: projects, isLoading } = useGetProjects();
  const { mutate: createProject, isLoading: isCreating } = useCreateProject({
    onSuccess: (newProject) => {
      onChange?.(newProject.id);
      setOpen(false);
      setSearch("");
    },
  });

  const selectedProject = useMemo(() => {
    return projects?.find((p) => p.id === value);
  }, [projects, value]);

  const filteredProjects = useMemo(() => {
    if (!search.trim()) {
      return projects ?? [];
    }
    const searchLower = search.toLowerCase();
    return (
      projects?.filter((project) =>
        (project.title || PROJECT_TITLE_FALLBACK)
          .toLowerCase()
          .includes(searchLower)
      ) ?? []
    );
  }, [projects, search]);

  const showCreateOption =
    search.trim() &&
    !filteredProjects.some(
      (p) =>
        (p.title || PROJECT_TITLE_FALLBACK).toLowerCase() ===
        search.toLowerCase()
    );

  const handleSelect = (projectId: string) => {
    if (projectId === "") {
      onChange?.(undefined);
    } else {
      const newValue = projectId === value ? undefined : projectId;
      onChange?.(newValue);
    }
    setOpen(false);
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between font-normal"
          disabled={disabled}
        >
          {selectedProject ? (
            <span className="flex items-center gap-1">
              <ProjectIcon
                className="size-4"
                style={{ color: selectedProject.color }}
              />
              <span className="text-ellipsis line-clamp-1">
                {selectedProject.title || PROJECT_TITLE_FALLBACK}
              </span>
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <ProjectIcon className="size-4" />
              <span>Select project...</span>
            </span>
          )}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search projects..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Spinner />
              </div>
            ) : (
              <>
                <CommandEmpty>
                  {showCreateOption ? (
                    <CommandItem
                      onSelect={handleCreateProject}
                      disabled={isCreating}
                    >
                      <Plus className="size-4" />
                      <span>Create project &quot;{search.trim()}&quot;</span>
                    </CommandItem>
                  ) : (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No projects found.
                    </div>
                  )}
                </CommandEmpty>
                {filteredProjects.length > 0 && (
                  <CommandGroup>
                    {value && (
                      <CommandItem
                        value="remove"
                        onSelect={() => handleSelect("")}
                      >
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
                        <ProjectIcon
                          className="size-4"
                          style={{ color: project.color }}
                        />
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
                    {showCreateOption && (
                      <CommandItem
                        onSelect={handleCreateProject}
                        disabled={isCreating}
                      >
                        <Plus className="size-4" />
                        <span>Create project &quot;{search.trim()}&quot;</span>
                      </CommandItem>
                    )}
                  </CommandGroup>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
