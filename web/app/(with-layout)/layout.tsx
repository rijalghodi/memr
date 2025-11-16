import { AppSidebar } from "@/components/layouts/app-sidebar";
import { Main } from "@/components/layouts/main";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import React from "react";

type Props = {};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-sidebar">
        <Main>{children}</Main>
      </SidebarInset>
    </SidebarProvider>
  );
}
