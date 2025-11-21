"use client";

import { ArrowDownUp, ListFilter, Plus } from "lucide-react";
import { useState } from "react";

import { PROJECT_TITLE_FALLBACK } from "@/lib/constant";
import { getRandomColor } from "@/lib/random-color";
import { getRoute, ROUTES } from "@/lib/routes";
import { projectApiHook, useGetProjects } from "@/service/local/api-project";

import { useBrowserNavigate } from "../browser-navigation";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui";
import { Button } from "../ui/button";
import { DropdownFilter } from "../ui/drropdown-filter";
import { ProjectEmpty } from "./project-empty";
import { ProjectItem } from "./project-item";
import { ProjectLoading } from "./project-loading";

type SortByValue = "updatedAt" | "viewedAt" | "createdAt";

export function ProjectDashboard() {
  const [sortBy, setSortBy] = useState<SortByValue>("updatedAt");
  const { navigate } = useBrowserNavigate();
  const { data: projects, isLoading } = useGetProjects({ sortBy });

  const handleSortChange = (value: string) => {
    setSortBy(value as SortByValue);
  };

  // add project
  const { mutate: createProject } = projectApiHook.useCreateProject({
    onSuccess: (data) => {
      navigate(
        getRoute(ROUTES.PROJECT, { projectId: data.id }),
        PROJECT_TITLE_FALLBACK,
      );
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
      <div data-slot="content" className="pb-6">
        {isLoading ? (
          <ProjectLoading />
        ) : projects.length === 0 ? (
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
  value: SortByValue;
  onValueChange: (value: SortByValue) => void;
};

function ProjectSort({ value, onValueChange }: ProjectSortProps) {
  return (
    <DropdownFilter
      variant="secondary"
      className="rounded-full px-4"
      value={value}
      onValueChange={onValueChange}
      icon={<ArrowDownUp />}
      options={[
        {
          label: "Last Modified",
          value: "updatedAt",
        },
        {
          label: "Last Viewed",
          value: "viewedAt",
        },
        {
          label: "Created",
          value: "createdAt",
        },
      ]}
    />
  );
}
