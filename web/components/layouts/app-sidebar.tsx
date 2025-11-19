"use client";

import { format } from "date-fns";
import {
  ArrowRight,
  ChevronDown,
  LogOutIcon,
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
import { useGetNotes } from "@/service/local/api-note";
import { useGetProjects } from "@/service/local/api-project";
import { useGetSetting } from "@/service/local/api-setting";

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

type Menu = {
  title: string;
  href: string;
  submenu?: Menu[];
  seeAllHref?: string;
};

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-3 flex flex-col gap-0">
        <ProfileButton />
        <SidebarMenuButton asChild size="default">
          <Link href="/">
            <SquarePen />
            Add Note
          </Link>
        </SidebarMenuButton>
        <SidebarMenuButton asChild size="default">
          <Link href="/">
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
  const { data: notes } = useGetNotes({ sortBy: "viewedAt" });
  const { data: collections } = useGetCollections({ sortBy: "viewedAt" });
  const { data: projects } = useGetProjects({ sortBy: "viewedAt" });

  const items: Menu[] = useMemo(
    () => [
      {
        title: "Notes",
        href: "/",
        seeAllHref: "/tasks",
        submenu:
          notes?.slice(0, 5).map((note) => ({
            title:
              extractTitleFromContent(note.content || "") || "Untitled Note",
            href: `/notes/${note.id}`,
          })) ?? [],
      },
      {
        title: "Collections",
        href: "/collections",
        submenu:
          collections?.slice(0, 5).map((collection) => ({
            title: collection.title || "Untitled Collection",
            href: `/collections/${collection.id}`,
          })) ?? [],
      },
      {
        title: "Projects",
        href: "/projects",
        submenu:
          projects?.slice(0, 5).map((project) => ({
            title: project.title || "Untitled Project",
            href: `/projects/${project.id}`,
          })) ?? [],
      },
    ],
    [notes],
  );

  return (
    <SidebarMenu className="gap-5">
      {items.map((item, idx) =>
        item.submenu ? (
          <Collapsible asChild key={`${idx}-entity-menu-collapsible`}>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton size="sm" className="font-semibold">
                  <ChevronDown className="size-3 group-data-[state=open]:rotate-180 transform transition-transform duration-200 ease-in-out" />
                  {item.title}
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.submenu.map((subitem, idx) => (
                    <SidebarMenuSubItem key={`${idx}-entity-menu-sub-item`}>
                      <SidebarMenuSubButton size="sm" asChild>
                        <Link href={subitem.href}>
                          <span>{subitem.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                  {item.seeAllHref && (
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        size="sm"
                        className="font-medium"
                        asChild
                      >
                        <Link href={item.seeAllHref}>
                          See All
                          <ArrowRight />
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  )}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ) : (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton size="sm" asChild>
              <Link href={item.href}>
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ),
      )}
    </SidebarMenu>
  );
}

export function extractTitleFromContent(content: string) {
  if (!content) return "";
  const title = content.trim().replace(/^\s*(\S)/, (m, c) => c);
  return title.length > 103 ? title.slice(0, 100) + "..." : title;
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
