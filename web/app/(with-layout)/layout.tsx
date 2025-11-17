"use client";

import React from "react";

import { AppSidebar } from "@/components/layouts/app-sidebar";
import { AuthGuard } from "@/components/layouts/auth-guard";
import { Main } from "@/components/layouts/main";
import { useAutoSync } from "@/components/sync/use-auto-sync";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, lastSyncTime } = useAutoSync();
  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-sidebar">
          <Main>
            {isLoading ? <div>Syncing... {lastSyncTime}</div> : "Synced"}
            {children}
          </Main>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}
