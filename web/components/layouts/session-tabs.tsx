import { ChevronLeft, ChevronRight, Home, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

import { useSessionTabs } from "../session-tabs";
import { useConfirmation } from "../ui/confirmation-dialog";

export function SessionTabs() {
  const navigate = useNavigate();
  const { sessionTabs, activeTab, pathname, closeTab } = useSessionTabs();
  const isHomeActive = pathname === ROUTES.HOME;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const handleTabClick = (pathname: string) => {
    navigate(pathname);
  };

  const handleHomeClick = () => {
    navigate(ROUTES.HOME);
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
        navigate(sessionTabs[tabIndex - 1].pathname);
      } else if (sessionTabs.length > 1) {
        // Navigate to next tab (now at index 0)
        navigate(sessionTabs[1].pathname);
      } else {
        // No more tabs, navigate to home
        navigate(ROUTES.HOME);
      }
    }
  };

  const checkScrollability = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    checkScrollability();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollability);
      // Check on resize
      window.addEventListener("resize", checkScrollability);
      return () => {
        container.removeEventListener("scroll", checkScrollability);
        window.removeEventListener("resize", checkScrollability);
      };
    }
  }, [sessionTabs]);

  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  const { confirm } = useConfirmation();

  const handleCloseAllTabs = () => {
    confirm({
      title: "Close all tabs",
      message: `You are about to close ${sessionTabs.length} tabs. Sure?`,
      variant: "destructive",
      confirmLabel: "Close",
      cancelLabel: "Cancel",
      onConfirm: () => {
        sessionTabs.forEach((tab) => {
          closeTab(tab.id);
        });
        navigate(ROUTES.HOME);
      },
    });
  };

  return (
    <nav className="w-full h-10.5 flex-1 relative bg-muted">
      <ul className="flex items-center h-full overflow-hidden relative">
        <SessionTabItem
          active={isHomeActive}
          onClick={handleHomeClick}
          className="bg-muted data-[active=true]:bg-muted left-0 z-10 h-full"
        >
          <Home /> Home
        </SessionTabItem>
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            className="z-9 bg-muted h-full px-2 hover:bg-accent transition-colors"
            aria-label="Scroll left"
            style={{ boxShadow: "8px 0px 20px 0px rgba(0, 0, 0, 0.15)" }}
          >
            <ChevronLeft className="size-4" />
          </button>
        )}
        <div
          ref={scrollContainerRef}
          className="relative flex-1 h-full flex items-center overflow-x-auto scrollbar-hide border-t"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {sessionTabs.map((tab) => (
            <SessionTabItem
              key={tab.id}
              active={activeTab?.id === tab.id}
              onClick={() => handleTabClick(tab.pathname)}
              onClose={(e) => handleCloseTab(e, tab.id)}
            >
              <span className="w-full truncate">{tab.title}</span>
            </SessionTabItem>
          ))}
        </div>

        {canScrollRight && (
          <button
            onClick={scrollRight}
            className="bg-muted h-full px-2 hover:bg-accent transition-all"
            aria-label="Scroll right"
            style={{ boxShadow: "-8px 0px 20px 0px rgba(0, 0, 0, 0.15)" }}
          >
            <ChevronRight className="size-4" />
          </button>
        )}

        {sessionTabs.length > 0 && (
          <button
            onClick={() => handleCloseAllTabs()}
            className="bg-muted h-full px-3 hover:bg-accent transition-colors"
            aria-label="Close all tabs"
          >
            <X className="size-3.5" />
          </button>
        )}
      </ul>
    </nav>
  );
}

function SessionTabItem({
  children,
  active,
  onClick,
  onClose,
  className,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  onClose?: (e: React.MouseEvent) => void;
  className?: string;
}) {
  return (
    <li
      className={cn(
        "group relative flex gap-1.5 items-center h-full px-3 cursor-pointer data-[active=false]:hover:bg-accent",
        "text-xs font-medium [&>svg]:size-3.5 text-foreground/90 border-b border-b-transparent",
        "data-[active=true]:bg-background data-[active=true]:border-b-primary data-[active=true]:border-b data-[active=true]:text-primary transition-all duration-100",
        "max-w-48 min-w-24",
        className
      )}
      data-active={active}
      onClick={onClick}
    >
      {children}

      {onClose && (
        <button
          onClick={onClose}
          className={cn(
            "absolute right-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-100",
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
