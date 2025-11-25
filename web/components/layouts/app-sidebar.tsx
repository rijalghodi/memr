"use client";

import { ArrowRight, ChevronDown, LogOutIcon, Plus, SquareCheckBig, SquarePen } from "lucide-react";
import { JSX, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar-memr";
import { useLogout } from "@/hooks/use-logout";
import { getRandomColor } from "@/lib/color";
import {
  COLLECTION_TITLE_FALLBACK,
  NOTE_TITLE_FALLBACK,
  PROJECT_TITLE_FALLBACK,
} from "@/lib/constant";
import { formatDate } from "@/lib/date";
import { getRoute, ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useGetCurrentUser } from "@/service/api-auth";
import { collectionApi, useGetCollections } from "@/service/local/api-collection";
import { noteApi, noteApiHook, useGetNotes } from "@/service/local/api-note";
import { projectApi, useGetProjects } from "@/service/local/api-project";
import { useGetSetting } from "@/service/local/api-setting";

import { useBrowserNavigate } from "../browser-navigation";
import { CollectionIcon } from "../collections/collection-icon";
import { NoteIcon } from "../notes/note-icon";
import { ProjectIcon } from "../projects/project-icon";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card";

export function AppSidebar() {
  const { navigate } = useBrowserNavigate();

  // handle add button
  const { mutate: createNote } = noteApiHook.useCreateNote({
    onSuccess: (data) => {
      navigate(getRoute(ROUTES.NOTE, { noteId: data.id }));
    },
  });

  const handleAddNote = () => {
    createNote({});
  };

  return (
    <Sidebar>
      <SidebarHeader className="pt-3 flex flex-col gap-0">
        <ProfileButton />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="default" onClick={handleAddNote}>
                  <SquarePen />
                  Add Note
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild size="default">
                  <Link to={ROUTES.TASKS}>
                    <SquareCheckBig />
                    Todo
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarEntityMenus />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem className="flex justify-end items-center">
            <SidebarTrigger className="rounded-full" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

type TEntityMenu = {
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
  const { open, setOpen } = useSidebar();

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
                          <ChevronDown className="size-3 group-data-[state=open]/entity-menu:-rotate-180 transform transition-transform duration-200 ease-in-out" />
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
                          <Plus className="size-3.5" />
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

export function ProfileButton() {
  const { data: lastSyncTimeSetting } = useGetSetting("lastSyncTime");
  const { logout } = useLogout();
  const lastSyncTime = lastSyncTimeSetting?.value as string | undefined;
  const { data: user } = useGetCurrentUser();
  const userName = user?.data?.name || "User";
  const userEmail = user?.data?.email || "";
  const userImage = user?.data?.googleImage;
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="data-[state=open]:bg-sidebar-accent">
            <SidebarMenuButton size="default">
              <Avatar className="size-6">
                <AvatarImage src={userImage} />
                <AvatarFallback>{userName}</AvatarFallback>
              </Avatar>
              <span>{userName}</span>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[240px] rounded-lg" align="start">
            <DropdownMenuLabel className="flex items-center gap-2">
              <Avatar className="size-6">
                <AvatarImage src={userImage} />
                <AvatarFallback>{userName}</AvatarFallback>
              </Avatar>
              <div className="space-y-0.5">
                <div className="text-xs font-medium">{userName}</div>
                <div className="text-xs text-muted-foreground">{userEmail}</div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={logout}>
              <LogOutIcon />
              Logout
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-normal pt-2 pb-2">
              Last synced:{" "}
              {lastSyncTime
                ? formatDate(new Date(lastSyncTime), undefined, {
                    includeTime: true,
                  })
                : "Never"}
            </DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
