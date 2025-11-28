"use client";

import { LogOutIcon } from "lucide-react";

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar-memr";
import { useLogout } from "@/hooks/use-logout";
import { formatDate } from "@/lib/date";
import { useGetCurrentUser } from "@/service/api-auth";
import { useGetLastSyncTime, useGetOfflineCurrentUser } from "@/service/local/api-setting";

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
} from "../../ui";
import { useAuthGuard } from "../auth-guard";

export function ProfileButton() {
  const { isOnline } = useAuthGuard();
  const { value: lastSyncTime } = useGetLastSyncTime();
  const { logout } = useLogout();
  const { data: user } = useGetCurrentUser();
  const { value: offlineUser } = useGetOfflineCurrentUser();

  const userName = isOnline ? user?.data?.name || "User" : offlineUser?.name || "User";
  const userEmail = isOnline ? user?.data?.email || "" : offlineUser?.email || "";
  const userImage = isOnline ? user?.data?.googleImage : offlineUser?.googleImage || "";

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
