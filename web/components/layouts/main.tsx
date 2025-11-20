import { Home, RefreshCcw, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import logo from "@/public/logo-long.png";

import { useSessionTabs } from "../session-tabs";
import { useAutoSync } from "../sync/use-auto-sync";
import { Button } from "../ui";
import { ExampleChat } from "./example-chat";
type Props = {
  children: React.ReactNode;
};

export function Main({ children }: Props) {
  const { isSyncing, sync } = useAutoSync();
  return (
    <div className="flex flex-col h-full">
      <div className="h-12 flex items-center justify-between px-4">
        <div />
        <Image src={logo} alt="logo" width={80} height={24} />

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
      <div className="flex w-full h-full gap-2 flex-1">
        {/* Mmain coontent */}
        <div className="bg-background rounded-2xl flex-1 shadow-lg">
          <SessionTabs />
          <div className="overflow-y-auto h-[calc(100vh-8rem)]">{children}</div>
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
  const router = useRouter();
  const { sessionTabs, activeTab, pathname, setActiveTab, closeTab } =
    useSessionTabs();
  const isHomeActive = pathname === ROUTES.HOME;

  const handleTabClick = (pathname: string) => {
    router.push(pathname);
  };

  const handleHomeClick = () => {
    router.push(ROUTES.HOME);
  };

  const handleCloseTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const tabIndex = sessionTabs.findIndex((tab) => tab.id === id);
    const isActive = activeTab?.id === id;

    closeTab(id);

    // If closing active tab, navigate to previous tab (or next if no previous)
    if (isActive) {
      if (tabIndex > 0) {
        // Navigate to previous tab
        router.push(sessionTabs[tabIndex - 1].pathname);
      } else if (sessionTabs.length > 1) {
        // Navigate to next tab (now at index 0)
        router.push(sessionTabs[1].pathname);
      } else {
        // No more tabs, navigate to home
        router.push(ROUTES.HOME);
      }
    }
  };

  return (
    <nav className="overflow-x-auto w-full rounded-t-2xl">
      <ul className="flex items-center h-10 border-b">
        <SessionTabItem active={isHomeActive} onClick={handleHomeClick}>
          <Home />
          Home
        </SessionTabItem>
        {sessionTabs.map((tab) => (
          <SessionTabItem
            key={tab.id}
            active={activeTab?.id === tab.id}
            onClick={() => handleTabClick(tab.pathname)}
            onClose={(e) => handleCloseTab(e, tab.id)}
          >
            <span className="w-full overflow-hidden text-ellipsis whitespace-nowrap">
              {tab.title}
            </span>
          </SessionTabItem>
        ))}
      </ul>
    </nav>
  );
}

function SessionTabItem({
  children,
  active,
  onClick,
  onClose,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  onClose?: (e: React.MouseEvent) => void;
}) {
  return (
    <li
      className={cn(
        "group relative flex gap-1.5 items-center h-10 px-3 cursor-pointer data-[active=false]:hover:bg-accent",
        "text-xs font-medium [&>svg]:size-3.5 border-r border-l border-r-muted border-l-muted text-foreground/90",
        "data-[active=true]:border-b-primary data-[active=true]:border-b data-[active=true]:text-primary",
        "max-w-48 min-w-12"
      )}
      data-active={active}
      onClick={onClick}
    >
      {children}

      {onClose && (
        <button
          onClick={onClose}
          className={cn(
            "absolute right-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity",
            "h-full pr-2 pl-0.5 flex items-center justify-center",
            "bg-accent group-data-[active=true]:bg-background text-muted-foreground hover:text-foreground"
          )}
          aria-label="Close tab"
        >
          <X className="size-3.5" />
        </button>
      )}
    </li>
  );
}
