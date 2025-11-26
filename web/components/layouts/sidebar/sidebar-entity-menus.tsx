"use client";

import { ArrowRight, ChevronDown, Plus } from "lucide-react";
import { JSX, useCallback, useMemo } from "react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar-memr";
import { getRandomColor } from "@/lib/color";
import {
  COLLECTION_TITLE_FALLBACK,
  NOTE_TITLE_FALLBACK,
  PROJECT_TITLE_FALLBACK,
} from "@/lib/constant";
import { getRoute, ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { collectionApi, useGetCollections } from "@/service/local/api-collection";
import { noteApi, useGetNotes } from "@/service/local/api-note";
import { projectApi, useGetProjects } from "@/service/local/api-project";

import { useBrowserNavigate } from "../../browser-navigation";
import { CollectionIcon } from "../../collections/collection-icon";
import { NoteIcon } from "../../notes/note-icon";
import { ProjectIcon } from "../../projects/project-icon";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../../ui/hover-card";

export type TEntityMenu = {
  title: string;
  href: string;
  icon?: JSX.Element;
  submenu?: TEntityMenu[];
  seeAllHref?: string;
  onAdd?: () => void;
};

export function SidebarEntityMenus() {
  const { navigate } = useBrowserNavigate();
  const { data: notes } = useGetNotes({ sortBy: "updatedAt" });
  const { data: collections } = useGetCollections({ sortBy: "updatedAt" });
  const { data: projects } = useGetProjects({ sortBy: "updatedAt" });
  const { open } = useSidebar();

  const handleAddNote = useCallback(async () => {
    const note = await noteApi.create({});
    navigate(getRoute(ROUTES.NOTE, { noteId: note.id }));
  }, [navigate]);

  const handleAddCollection = useCallback(async () => {
    const collection = await collectionApi.create({
      title: "",
      color: getRandomColor(),
    });
    navigate(getRoute(ROUTES.COLLECTION, { collectionId: collection.id }));
  }, [navigate]);

  const handleAddProject = useCallback(async () => {
    const project = await projectApi.create({
      title: "",
      color: getRandomColor(),
    });
    navigate(getRoute(ROUTES.PROJECT, { projectId: project.id }));
  }, [navigate]);

  const items: TEntityMenu[] = useMemo(
    () => [
      {
        title: "Notes",
        href: ROUTES.NOTES,
        seeAllHref: ROUTES.NOTES,
        icon: <NoteIcon />,
        onAdd: handleAddNote,
        submenu:
          notes?.slice(0, 5).map((note) => ({
            title: note.title || NOTE_TITLE_FALLBACK,
            href: getRoute(ROUTES.NOTE, { noteId: note.id }),
            icon: <NoteIcon color="var(--muted-foreground)" />,
          })) ?? [],
      },
      {
        title: "Collections",
        href: ROUTES.COLLECTIONS,
        seeAllHref: ROUTES.COLLECTIONS,
        icon: <CollectionIcon />,
        onAdd: handleAddCollection,
        submenu:
          collections?.slice(0, 5).map((collection) => ({
            title: collection.title || COLLECTION_TITLE_FALLBACK,
            href: getRoute(ROUTES.COLLECTION, { collectionId: collection.id }),
            icon: <CollectionIcon style={{ color: collection.color }} />,
          })) ?? [],
      },
      {
        title: "Projects",
        href: ROUTES.PROJECTS,
        seeAllHref: ROUTES.PROJECTS,
        icon: <ProjectIcon className="size-4" />,
        onAdd: handleAddProject,
        submenu:
          projects?.slice(0, 5).map((project) => ({
            title: project.title || PROJECT_TITLE_FALLBACK,
            href: getRoute(ROUTES.PROJECT, { projectId: project.id }),
            icon: <ProjectIcon className="size-5" style={{ color: project.color }} />,
          })) ?? [],
      },
    ],
    [notes, collections, projects, handleAddNote, handleAddCollection, handleAddProject]
  );

  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        return (
          <SidebarMenu key={`${idx}-entity-menu`}>
            <Collapsible asChild key={`${idx}-entity-menu-collapsible`}>
              <HoverCard openDelay={300} closeDelay={300}>
                <SidebarMenuItem>
                  {/* TRIGGERS */}
                  <CollapsibleTrigger asChild>
                    <HoverCardTrigger asChild>
                      <SidebarMenuButton size="sm" className="font-semibold group/entity-menu">
                        {open ? (
                          <ChevronDown className="size-3 group-data-[state=open]/entity-menu:-rotate-180 transition-all" />
                        ) : (
                          item.icon
                        )}
                        <span className="truncate">{item.title}</span>
                        <SidebarMenuAction
                          onClick={(e) => {
                            e.stopPropagation();
                            item.onAdd?.();
                          }}
                        >
                          <Plus className="size-3" />
                        </SidebarMenuAction>
                      </SidebarMenuButton>
                    </HoverCardTrigger>
                  </CollapsibleTrigger>

                  {/* COLLAPSIBLE CONTENT */}
                  <CollapsibleContent className={cn(open ? "block" : "hidden")}>
                    <SidebarMenuSub>
                      {item.submenu?.length === 0 ? (
                        <div className="text-xs text-muted-foreground flex items-center h-12 px-6">
                          No {item.title.toLowerCase()}
                        </div>
                      ) : (
                        <>
                          {item.submenu?.map((subitem, idx) => {
                            return (
                              <SidebarMenuSubItem key={`${idx}-entity-menu-sub-item`}>
                                <SidebarMenuSubButton
                                  size="sm"
                                  onClick={() => navigate(subitem.href)}
                                >
                                  {subitem.icon}
                                  <span className="truncate">
                                    {subitem.title || NOTE_TITLE_FALLBACK}
                                  </span>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </>
                      )}
                      {item.seeAllHref && (
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            size="sm"
                            className="font-semibold w-fit"
                            onClick={() => navigate(item.seeAllHref!)}
                          >
                            See All
                            <ArrowRight />
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )}
                    </SidebarMenuSub>
                  </CollapsibleContent>

                  {/* HOVER CARD CONTENT */}
                  <HoverCardContent
                    side="right"
                    align="start"
                    className={cn(open ? "hidden" : "block")}
                  >
                    <SidebarGroupLabel>Recent {item.title}</SidebarGroupLabel>
                    <SidebarMenuSub>
                      {item.submenu?.length === 0 ? (
                        <div className="text-xs text-muted-foreground flex items-center h-12 px-6">
                          No {item.title.toLowerCase()}
                        </div>
                      ) : (
                        <>
                          {item.submenu?.map((subitem, idx) => {
                            return (
                              <SidebarMenuSubItem key={`${idx}-entity-menu-sub-item`}>
                                <SidebarMenuSubButton
                                  size="sm"
                                  onClick={() => navigate(subitem.href)}
                                >
                                  {subitem.icon}
                                  {subitem.title || NOTE_TITLE_FALLBACK}
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </>
                      )}
                      {item.seeAllHref && (
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            size="sm"
                            className="font-semibold w-fit"
                            onClick={() => navigate(item.seeAllHref!)}
                          >
                            See All
                            <ArrowRight />
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )}
                    </SidebarMenuSub>
                  </HoverCardContent>
                </SidebarMenuItem>
              </HoverCard>
            </Collapsible>
          </SidebarMenu>
        );
      })}
    </div>
  );
}
