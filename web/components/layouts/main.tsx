import { RefreshCcw } from "lucide-react";
import React from "react";

import { useAutoSync } from "../sync/use-auto-sync";
import { Button } from "../ui";
import { ExampleChat } from "./example-chat";
import { SessionTabs } from "./session-tabs";
type Props = {
  children: React.ReactNode;
};

export function Main({ children }: Props) {
  const { isSyncing, sync } = useAutoSync();
  return (
    <div className="flex flex-col h-full items-stretch">
      <div className="h-12 flex items-center justify-between px-4">
        <div />

        <img src="/logo-long.png" alt="logo" width={80} height={24} />

        <Button
          variant="ghost-primary"
          size="icon"
          onClick={() => sync()}
          title="Sync"
        >
          <RefreshCcw
            data-syncing={isSyncing}
            className={"size-4 data-[syncing=true]:animate-spin"}
          />
        </Button>
      </div>
      <div className="flex w-full h-full gap-0 flex-1">
        <div className="bg-background rounded-t-2xl flex-1 overflow-hidden shadow-lg">
          <SessionTabs />
          <div className="overflow-y-auto h-[calc(100vh-5.5rem)]">
            {children}
          </div>
        </div>

        <div className="bg-background rounded-t-2xl w-full min-w-[300px] max-w-[400px]">
          <ExampleChat />
        </div>
      </div>
    </div>
  );
}
