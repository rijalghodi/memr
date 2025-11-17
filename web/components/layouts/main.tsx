import { Home } from "lucide-react";
import Image from "next/image";
import React from "react";

import { cn } from "@/lib/utils";
import logo from "@/public/logo-long.png";

import { ExampleChat } from "./example-chat";
type Props = {
  children: React.ReactNode;
};

export function Main({ children }: Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="h-12 flex items-center justify-center px-4">
        <Image src={logo} alt="logo" width={80} height={24} />
      </div>
      <div className="flex w-full h-full gap-2 flex-1">
        {/* Mmain coontent */}
        <div className="bg-background rounded-2xl flex-1 shadow-lg">
          <SessionTabs />
          {children}
        </div>
        {/* Chat Sidebar */}
        <div className="bg-background rounded-2xl w-full min-w-[300px] max-w-[400px]">
          <ExampleChat />
        </div>
      </div>
    </div>
  );
}

export function SessionTabs() {
  return (
    <ul className="flex items-center h-10 border-b rounded-t-2xl">
      <SessionTabItem active>
        <Home />
        Home
      </SessionTabItem>
      <SessionTabItem>Tasks</SessionTabItem>
      <SessionTabItem>Notes</SessionTabItem>
      <SessionTabItem>Collections</SessionTabItem>
    </ul>
  );
}

function SessionTabItem({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <li
      className={cn(
        "flex gap-1.5 items-center justify-center h-10 px-4 cursor-pointer hover:bg-muted text-xs font-medium [&>svg]:size-3.5 border-b-2 border-transparent",
        "data-[active=true]:border-primary data-[active=true]:text-primary",
      )}
      data-active={active}
    >
      {children}
    </li>
  );
}
