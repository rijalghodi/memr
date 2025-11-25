import React from "react";
import { Outlet } from "react-router-dom";

import { AppSidebar } from "@/components/layouts/app-sidebar";
import { AuthGuard } from "@/components/layouts/auth-guard";
import { Main } from "@/components/layouts/main";
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
