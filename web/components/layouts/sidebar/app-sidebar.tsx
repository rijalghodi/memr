"use client";

import { ListTodo } from "lucide-react";
import { Link } from "react-router-dom";

import { NoteIcon } from "@/components/notes/note-icon";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar-memr";
import { getRoute, ROUTES } from "@/lib/routes";
import { noteApiHook } from "@/service/local/api-note";

import { useBrowserNavigate } from "../../browser-navigation";
import { ProfileButton } from "./profile-button";
import { SidebarEntityMenus } from "./sidebar-entity-menus";

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
      <SidebarHeader className="flex flex-col gap-0">
        <ProfileButton />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild size="default">
                  <Link to={ROUTES.NOTES}>
                    <NoteIcon />
                    Notes
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild size="default">
                  <Link to={ROUTES.TASKS}>
                    <ListTodo />
                    Tasks
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
