"use client";

import { ArrowDownUp, ListFilter, Plus } from "lucide-react";
import { useState } from "react";

import { getRandomColor } from "@/lib/color";
import { getRoute, ROUTES } from "@/lib/routes";
import { projectApiHook, useGetProjects } from "@/service/local/api-project";

import { useBrowserNavigate } from "../browser-navigation";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui";
import { Button } from "../ui/button";
import { DropdownFilter } from "../ui/drropdown-filter";
import { ProjectEmpty } from "./project-empty";
import { ProjectItem } from "./project-item";

type SortByValue = "updatedAt" | "createdAt";

export function ProjectDashboard() {
  const [sortBy, setSortBy] = useState<SortByValue | undefined>();
  const { navigate } = useBrowserNavigate();
  const { data: projects, isLoading } = useGetProjects({ sortBy });

  const handleSortChange = (value: string) => {
    setSortBy(value as SortByValue);
  };

  console.log(sortBy);

  // add project
  const { mutate: createProject } = projectApiHook.useCreateProject({
    onSuccess: (data) => {
      navigate(getRoute(ROUTES.PROJECT, { projectId: data.id }));
    },
  });

  const handleAddProject = () => {
    createProject({
      title: "",
      color: getRandomColor(),
    });
  };

  return (
    <div className="pt-6 space-y-4">
      {/* Header */}
      <Collapsible key="project-filter-collapsible">
        <div className="px-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-semibold">Projects</h1>
            </div>
            <div className="flex items-center gap-0">
              <Button variant="ghost" size="icon" onClick={handleAddProject}>
                <Plus />
              </Button>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon">
                  <ListFilter />
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
          <CollapsibleContent>
            <div className="flex items-center">
              <ProjectSort value={sortBy} onValueChange={handleSortChange} />
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
      {/* Content */}
      <div
        data-slot="content"
        className="pb-6 animate-in fade-in slide-in-from-bottom-3 duration-500"
      >
        {isLoading ? null : projects.length === 0 ? (
          <ProjectEmpty onAddProject={handleAddProject} />
        ) : (
          <ul className="flex flex-col">
            {projects.map((project) => (
              <ProjectItem key={project.id} {...project} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

type ProjectSortProps = {
  value?: SortByValue;
  onValueChange: (value: SortByValue) => void;
};

function ProjectSort({ value, onValueChange }: ProjectSortProps) {
  return (
    <DropdownFilter
      variant="secondary"
      className="rounded-full px-4"
      value={value}
      onValueChange={(value) => onValueChange(value as SortByValue)}
      icon={<ArrowDownUp />}
      placeholder="Sort by"
      options={[
        {
          label: "Last Modified",
          value: "updatedAt",
        },
        {
          label: "Last Created",
          value: "createdAt",
        },
      ]}
    />
  );
}
