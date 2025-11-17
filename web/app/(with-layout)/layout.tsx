"use client";

import { AppSidebar } from "@/components/layouts/app-sidebar";
import { Main } from "@/components/layouts/main";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAutoSync } from "@/components/sync/use-auto-sync";
import React from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, sync, lastSyncTime } = useAutoSync();
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-sidebar">
        <Main>
          {isLoading ? <div>Syncing... {lastSyncTime}</div> : "Synced"}
          {children}
        </Main>
      </SidebarInset>
    </SidebarProvider>
  );
}
