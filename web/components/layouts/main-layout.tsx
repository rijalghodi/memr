import { Bot, X } from "lucide-react";
import React, { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { ChatWidget } from "../chat/chat-widget";
import { useAutoSync } from "../sync/use-auto-sync";
import { Button } from "../ui";
import { SessionTabs } from "./session-tabs";
import MobileMenu from "./sidebar/mobile-menu";

type Props = {
  children: React.ReactNode;
};

export function MainLayout({ children }: Props) {
  const { sync } = useAutoSync();
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    // Sync on first load
    sync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="h-11 flex items-center justify-between px-4">
        <div>
          <div className="block md:hidden">
            <MobileMenu />
          </div>
        </div>

        <img src="/logo-long.png" alt="logo" width={80} height={24} />

        {/* <Button variant="ghost-primary" size="icon" onClick={() => sync()} title="Sync">
          <RefreshCcw
            data-syncing={isSyncing}
            className={"size-4 data-[syncing=true]:animate-spin"}
          />
        </Button> */}
      </div>
      {/* Body */}
      <div className="flex flex-1 w-full min-h-0 gap-1.5">
        <div className="bg-background rounded-t-2xl flex-1 shadow-xl flex flex-col overflow-hidden">
          <div className="shrink-0 h-10.5 grow-0">
            <SessionTabs />
          </div>
          <div className="flex-1 min-h-0">{children}</div>
        </div>

        <div className="bg-background rounded-t-2xl w-[380px] hidden lg:block">
          <ChatWidget />
        </div>
      </div>

      {/* Floating Chat Button - Only visible on smaller screens */}
      {!isChatOpen && (
        <Button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg lg:hidden"
          size="icon"
        >
          <Bot className="size-6" />
        </Button>
      )}

      {/* Floating Chat Widget - Bottom right corner */}
      <div
        data-state={isChatOpen ? "open" : "closed"}
        className={cn(
          "fixed bottom-0 inset-x-0 z-50 w-screen max-w-screen-lg h-screen max-h-[calc(100vh-2.75rem)] lg:hidden rounded-xl shadow-2xl",
          "data-[state=open]:opacity-100 data-[state=open]:scale-100 data-[state=open]:pointer-events-auto",
          "data-[state=closed]:opacity-0 data-[state=closed]:scale-95 data-[state=closed]:pointer-events-none",
          "transition-all duration-300"
        )}
      >
        <div className="relative h-full w-full">
          <Button
            onClick={() => setIsChatOpen(false)}
            className="absolute bg-background border -top-2 right-1 z-10 h-8 w-8 rounded-full shadow-lg"
            size="icon"
            variant="secondary"
          >
            <X className="size-4" />
          </Button>
          <ChatWidget />
        </div>
      </div>
    </div>
  );
}
