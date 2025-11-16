import { AppSidebar } from "@/components/layouts/app-sidebar";
import { Main } from "@/components/layouts/main";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AutoSync } from "@/components/sync/auto-sync";
import React from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-sidebar">
        <Main>{children}</Main>
      </SidebarInset>
      <AutoSync />
    </SidebarProvider>
  );
}
