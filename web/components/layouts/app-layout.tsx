import React from "react";
import { Outlet } from "react-router-dom";

import { AuthGuard } from "@/components/layouts/auth-guard";
import { MainLayout } from "@/components/layouts/main-layout";
import { AppSidebar } from "@/components/layouts/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar-memr";

export function AppLayout() {
  return (
    <AuthGuard>
      <div className="h-screen w-screen">
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="h-screen bg-sidebar">
            <MainLayout>
              <Outlet />
            </MainLayout>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </AuthGuard>
  );
}
