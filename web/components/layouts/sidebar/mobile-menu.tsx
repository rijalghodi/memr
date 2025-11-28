"use client";

import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  FileText,
  ListTodo,
  LogOutIcon,
  Plus,
} from "lucide-react";
import { JSX, useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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

import { useBrowserNavigate } from "../../browser-navigation";
import { CollectionIcon } from "../../collections/collection-icon";
import { NoteIcon } from "../../notes/note-icon";
import { ProjectIcon } from "../../projects/project-icon";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui";

export default function MobileMenu() {
  const { data: lastSyncTimeSetting } = useGetSetting("lastSyncTime");
  const { logout } = useLogout();
  const lastSyncTime = lastSyncTimeSetting?.value as string | undefined;
  const { data: user } = useGetCurrentUser();
  const userName = user?.data?.name || "User";
  const userEmail = user?.data?.email || "";
  const userImage = user?.data?.googleImage;

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="data-[state=open]:bg-sidebar-accent">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="size-6">
            <AvatarImage src={userImage} />
            <AvatarFallback>{userName}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-screen rounded-lg md:hidden border-none h-screen"
        align="start"
      >
        <DropdownMenuLabel className="flex items-center gap-2">
          <Avatar className="size-6">
            <AvatarImage src={userImage} />
            <AvatarFallback>{userName}</AvatarFallback>
          </Avatar>
          <div className="space-y-0.5 flex-1">
            <div className="text-xs font-medium">{userName}</div>
            <div className="text-xs text-muted-foreground">{userEmail}</div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
          >
            <ChevronRight
              className={cn("size-4 transition-transform", profileMenuOpen ? "rotate-180" : "")}
            />
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {profileMenuOpen ? (
          <>
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
          </>
        ) : (
          <>
            <MobileEntityShortcutMenu />
            <DropdownMenuSeparator />
            <MobileEntityMenus />
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MobileEntityShortcutMenu() {
  const { navigate } = useBrowserNavigate();

  const { mutate: createNote } = noteApiHook.useCreateNote({
    onSuccess: (data) => {
      navigate(getRoute(ROUTES.NOTE, { noteId: data.id }));
    },
  });

  const handleAddNote = () => {
    createNote({});
  };

  return (
    <DropdownMenuGroup>
      <DropdownMenuItem onClick={handleAddNote} className="h-10">
        <FileText />
        Notes
      </DropdownMenuItem>
      <DropdownMenuItem asChild className="h-10">
        <Link to={ROUTES.TASKS}>
          <ListTodo />
          Tasks
        </Link>
      </DropdownMenuItem>
    </DropdownMenuGroup>
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

function MobileEntityMenus() {
  const { navigate } = useBrowserNavigate();
  const { data: notes } = useGetNotes({ sortBy: "updatedAt" });
  const { data: collections } = useGetCollections({ sortBy: "updatedAt" });
  const { data: projects } = useGetProjects({ sortBy: "updatedAt" });

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
    <DropdownMenuGroup>
      {items.map((item, itemIdx) => (
        <Collapsible key={item.title} defaultOpen={true}>
          {/* Main category item with collapsible trigger */}
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="group/entity-menu w-full font-normal">
              <ChevronDown className="size-3 group-data-[state=open]/entity-menu:-rotate-180 transition-all" />
              {item.title}
              {item.onAdd && (
                <Plus
                  className="ml-auto size-3.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    item.onAdd?.();
                  }}
                />
              )}
            </Button>
          </CollapsibleTrigger>

          {/* Collapsible content */}
          <CollapsibleContent>
            {/* Recent items */}
            {item.submenu && item.submenu.length > 0 ? (
              <>
                {item.submenu.map((subitem, idx) => (
                  <DropdownMenuItem
                    key={`${item.title}-sub-${idx}`}
                    inset
                    onClick={() => navigate(subitem.href)}
                  >
                    {subitem.icon}
                    <span className="truncate text-ellipsis text-sm">
                      {subitem.title || NOTE_TITLE_FALLBACK}
                    </span>
                  </DropdownMenuItem>
                ))}
              </>
            ) : (
              <DropdownMenuItem inset disabled>
                <span className="text-xs text-muted-foreground">No {item.title.toLowerCase()}</span>
              </DropdownMenuItem>
            )}
            {item.seeAllHref && (
              <DropdownMenuItem inset onClick={() => navigate(item.seeAllHref!)}>
                See All
                <ArrowRight className="ml-auto" />
              </DropdownMenuItem>
            )}
          </CollapsibleContent>

          {/* Separator between categories (except for last item) */}
          {itemIdx < items.length - 1 && <DropdownMenuSeparator />}
        </Collapsible>
      ))}
    </DropdownMenuGroup>
  );
}
