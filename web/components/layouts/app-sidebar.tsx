"use client";

import { format } from "date-fns";
import {
  ArrowRight,
  ChevronDown,
  FileText,
  LogOutIcon,
  Plus,
  SquareCheckBig,
  SquarePen,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useGetCollections } from "@/service/local/api-collection";
import { noteApiHook, useGetNotes } from "@/service/local/api-note";
import { useGetProjects } from "@/service/local/api-project";
import { useGetSetting } from "@/service/local/api-setting";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui";
import { NOTE_TITLE_FALLBACK } from "@/lib/constant";
import { useSessionTabs } from "../session-tabs";
import { ROUTES } from "@/lib/routes";
import { useRouter } from "next/navigation";

type Menu = {
  title: string;
  href: string;
  submenu?: Menu[];
  seeAllHref?: string;
};

export function AppSidebar() {
  const router = useRouter();
  // handle add button
  const { addTab } = useSessionTabs();
  const { mutate: createNote } = noteApiHook.useCreateNote({
    onSuccess: (data) => {
      router.push(ROUTES.NOTE(data.id));
      addTab({
        title: NOTE_TITLE_FALLBACK,
        pathname: ROUTES.NOTE(data.id),
      });
    },
  });

  const handleAddNote = () => {
    createNote({});
  };

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-3 flex flex-col gap-0">
        <ProfileButton />
        <SidebarMenuButton size="default" onClick={handleAddNote}>
          <SquarePen />
          Add Note
        </SidebarMenuButton>
        <SidebarMenuButton asChild size="default">
          <Link href="/projects">
            <SquareCheckBig />
            Todo
          </Link>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent className="px-4">
        <SidebarEntityMenus />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}

export function SidebarEntityMenus() {
  const { data: notes } = useGetNotes({ sortBy: "updatedAt" });
  const { data: collections } = useGetCollections({ sortBy: "updatedAt" });
  const { data: projects } = useGetProjects({ sortBy: "updatedAt" });

  const items: Menu[] = useMemo(
    () => [
      {
        title: "Notes",
        href: ROUTES.NOTES,
        seeAllHref: ROUTES.NOTES,
        submenu:
          notes?.slice(0, 5).map((note) => ({
            title: note.title || NOTE_TITLE_FALLBACK,
            href: ROUTES.NOTE(note.id),
          })) ?? [],
      },
      {
        title: "Collections",
        href: ROUTES.COLLECTIONS,
        submenu:
          collections?.slice(0, 5).map((collection) => ({
            title: collection.title || "Untitled Collection",
            href: ROUTES.COLLECTION(collection.id),
          })) ?? [],
      },
      {
        title: "Projects",
        href: ROUTES.PROJECTS,
        submenu:
          projects?.slice(0, 5).map((project) => ({
            title: project.title || "Untitled Project",
            href: ROUTES.PROJECT(project.id),
          })) ?? [],
      },
    ],
    [notes]
  );

  return (
    <SidebarMenu className="gap-5">
      {items.map((item, idx) => {
        return (
          <Collapsible asChild key={`${idx}-entity-menu-collapsible`}>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton size="sm" className="font-semibold group">
                  <ChevronDown className="size-3 group-data-[state=open]:-rotate-180 transform transition-transform duration-200 ease-in-out" />
                  <span className="truncate">{item.title}</span>
                  <Button variant="plain-primary" size="icon-sm">
                    <Plus />
                  </Button>
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.submenu?.length === 0 ? (
                    <div className="text-xs text-muted-foreground flex items-center h-12 px-6">
                      No {item.title.toLowerCase()}
                    </div>
                  ) : (
                    <>
                      {item.submenu?.map((subitem, idx) => {
                        return (
                          <SidebarMenuSubItem
                            key={`${idx}-entity-menu-sub-item`}
                          >
                            <SidebarMenuSubButton size="sm" asChild>
                              <Link href={subitem.href}>
                                <FileText />
                                {subitem.title || NOTE_TITLE_FALLBACK}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                      {item.seeAllHref && (
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            size="sm"
                            className="font-semibold w-fit"
                            asChild
                          >
                            <Link href={item.seeAllHref}>
                              See All
                              <ArrowRight />
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )}
                    </>
                  )}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        );
      })}
    </SidebarMenu>
  );
}

export function ProfileButton() {
  const { data: lastSyncTimeSetting } = useGetSetting("lastSyncTime");
  const lastSyncTime = lastSyncTimeSetting?.value as string | undefined;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        className="data-[state=open]:bg-sidebar-accent"
      >
        <SidebarMenuButton size="default" className="mb-2">
          <Avatar className="size-6">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <span>John Doe</span>
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[240px] rounded-lg p-3" align="start">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Avatar className="size-6">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="space-y-0.5">
            <div className="text-xs font-medium">John Doe</div>
            <div className="text-xs text-muted-foreground">
              john.doe@example.com
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-normal">
          Last synced at:{" "}
          {lastSyncTime
            ? format(new Date(lastSyncTime), "dd/MM/yyyy HH:mm")
            : "Never"}
        </DropdownMenuLabel>
        <DropdownMenuItem className="cursor-pointer" variant="destructive">
          <LogOutIcon />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
