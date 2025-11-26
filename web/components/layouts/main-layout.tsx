import { Bot } from "lucide-react";
import React, { useEffect } from "react";

import { ChatWidget } from "../chat/chat-widget";
import { useAutoSync } from "../sync/use-auto-sync";
import { Button, Floating, FloatingContent, FloatingTrigger, useFloating } from "../ui";
import { SessionTabs } from "./session-tabs";
import MobileMenu from "./sidebar/mobile-menu";

type Props = {
  children: React.ReactNode;
};

function FloatingChatWidget() {
  const { close } = useFloating();

  return (
    <div className="relative h-full w-full">
      <ChatWidget withBackButton={true} onBackButtonClick={close} />
    </div>
  );
}

export function MainLayout({ children }: Props) {
  const { sync } = useAutoSync();

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

      {/* Floating Chat - Only visible on smaller screens */}
      <Floating>
        <FloatingTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg lg:hidden"
            size="icon"
          >
            <Bot className="size-6" />
          </Button>
        </FloatingTrigger>
        <FloatingContent>
          <FloatingChatWidget />
        </FloatingContent>
      </Floating>
    </div>
  );
}
