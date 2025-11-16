"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Edit2,
  LogOutIcon,
  PlusIcon,
  Square,
  SquareCheck,
  SquareCheckBig,
  SquarePen,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

import logo from "@/public/logo.png";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Button,
  DropdownMenuLabel,
} from "../ui";

type Menu = {
  title: string;
  href: string;
  submenu?: Menu[];
  seeAllHref?: string;
};

export function AppSidebar() {
  const items: Menu[] = [
    {
      title: "Notes",
      href: "/",
      seeAllHref: "/tasks",
      submenu: [
        {
          title: "Why We Need AI",
          href: "/why-we-need-ai",
        },
        {
          title: "How to Use AI",
          href: "/how-to-use-ai",
        },
      ],
    },
    {
      title: "Collections",
      href: "/collections",
      submenu: [
        {
          title: "My Collections",
          href: "/my-collections",
        },
        {
          title: "Create New Collection",
          href: "/create-new-collection",
        },
      ],
    },
    {
      title: "Projects",
      href: "/projects",
      submenu: [
        {
          title: "My Projects",
          href: "/my-projects",
        },
        {
          title: "Create New Project",
          href: "/create-new-project",
        },
      ],
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-3 flex flex-col gap-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="mb-2">
              <Avatar className="size-6">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <span>John Doe</span>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 rounded-lg">
            <DropdownMenuLabel className="flex items-center gap-2">
              <Avatar className="size-6">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <span>John Doe</span>
            </DropdownMenuLabel>
            <DropdownMenuItem className="cursor-pointer" variant="destructive">
              <LogOutIcon />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
        <SidebarMenu className="gap-5">
          {items.map((item) =>
            item.submenu ? (
              <Collapsible asChild key={`${item.title}-collapsible`}>
                <SidebarMenuItem key={item.title}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton size="sm" className="font-semibold">
                      <ChevronDown className="size-3 group-data-[state=open]:rotate-180 transform transition-transform duration-200 ease-in-out" />
                      {item.title}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.submenu.map((subitem) => (
                        <SidebarMenuSubItem key={subitem.title}>
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
            )
          )}
        </SidebarMenu>
        <SidebarGroup />
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
