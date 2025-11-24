import { RefreshCcw } from "lucide-react";
import React, { useEffect } from "react";

import { ChatWidget } from "../chat/chat-widget";
import { useAutoSync } from "../sync/use-auto-sync";
import { Button } from "../ui";
import { SessionTabs } from "./session-tabs";

type Props = {
  children: React.ReactNode;
};

export function Main({ children }: Props) {
  const { isSyncing, sync } = useAutoSync();

  useEffect(() => {
    // Sync on first load
    sync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="h-11 flex items-center justify-between px-4">
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
      {/* Body */}
      <div className="flex flex-1 w-full min-h-0 gap-1.5">
        <div className="bg-background rounded-t-2xl flex-1 shadow-xl flex flex-col overflow-hidden">
          <div className="shrink-0 h-10.5 grow-0">
            <SessionTabs />
          </div>
          <div className="flex-1 min-h-0">{children}</div>
        </div>

        <div className="bg-background rounded-t-2xl w-[380px]">
          <ChatWidget />
        </div>
      </div>
    </div>
  );
}

//  {
//    /* <ResizablePanelGroup direction="horizontal" className="w-full h-full">
//         <ResizablePanel defaultSize={600}>
//           <div className="bg-background rounded-t-2xl flex-1 overflow-hidden shadow-xl border">
//             <SessionTabs />
//             <div className="overflow-y-auto h-[calc(100vh-5.5rem)]">
//               {children}
//             </div>
//           </div>
//         </ResizablePanel>
//         <ResizableHandle withHandle className="w-1 bg-transparent" />
//         <ResizablePanel defaultSize={300}>
//           <ChatWidget />
//         </ResizablePanel>
//       </ResizablePanelGroup> */
//  }
