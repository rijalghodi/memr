import React from "react";
import { Outlet } from "react-router-dom";

import { AuthGuard } from "@/components/layouts/auth-guard";
import { Main } from "@/components/layouts/main";
import { AppSidebar } from "@/components/layouts/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar-memr";

export function AppLayout() {
  return (
    <AuthGuard>
      <div className="h-screen w-screen">
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="h-screen bg-sidebar">
            <Main>
              <Outlet />
            </Main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </AuthGuard>
  );
}
