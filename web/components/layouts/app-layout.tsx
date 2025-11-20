import React from "react";
import { Outlet } from "react-router-dom";

import { AppSidebar } from "@/components/layouts/app-sidebar";
import { AuthGuard } from "@/components/layouts/auth-guard";
import { Main } from "@/components/layouts/main";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function AppLayout() {
  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-sidebar">
          <Main>
            <Outlet />
          </Main>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}
