"use client";

import React from "react";

import { AppSidebar } from "@/components/layouts/app-sidebar";
import { AuthGuard } from "@/components/layouts/auth-guard";
import { Main } from "@/components/layouts/main";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-sidebar">
          <Main>{children}</Main>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}
