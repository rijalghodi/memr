import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Home, X } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";

import {
  COLLECTION_TITLE_FALLBACK,
  NOTE_TITLE_FALLBACK,
  PROJECT_TITLE_FALLBACK,
} from "@/lib/constant";
import { extractRoute, ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useGetCollection } from "@/service/local/api-collection";
import { useGetNote } from "@/service/local/api-note";
import { useGetProject } from "@/service/local/api-project";

import { useBrowserNavigate } from "../browser-navigation";
import { useSessionTabs } from "../session-tabs";
import { Button } from "../ui";
import { useConfirmation } from "../ui/confirmation-dialog";

export function SessionTabs() {
  const { sessionTabs: rawSessionTabs, pathname, closeAllTabs } = useSessionTabs();
  const sessionTabs = rawSessionTabs.filter((tab) => tab.pathname !== ROUTES.HOME);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const { canGoBack, canGoForward, navigate: navigateTo, goBack, goForward } = useBrowserNavigate();

  const handleGoBack = () => {
    goBack();
  };

  const handleGoForward = () => {
    goForward();
  };

  const handleHomeClick = () => {
    navigateTo(ROUTES.HOME);
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
      message: `You are about to close ${sessionTabs.length} tabs. Continue?`,
      variant: "destructive",
      confirmLabel: "Yes, Continue",
      cancelLabel: "Cancel",
      onConfirm: () => {
        closeAllTabs();
        navigateTo(ROUTES.HOME);
      },
    });
  };

  return (
    <nav className="h-10.5 flex-1 relative bg-muted flex">
      <ul className="flex-1 flex items-center h-full overflow-hidden relative">
        <div className="flex items-center h-full">
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-full rounded-none"
            title="Previous Page"
            onClick={handleGoBack}
            disabled={!canGoBack}
          >
            <ArrowLeft />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-full rounded-none"
            title="Next Page"
            onClick={handleGoForward}
            disabled={!canGoForward}
          >
            <ArrowRight />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          className="bg-muted border-b border-transparent data-[active=true]:border-primary left-0 z-10 h-full justify-center min-w-10 rounded-none"
          title="Home"
          data-active={pathname === ROUTES.HOME}
          onClick={handleHomeClick}
        >
          <Home />
        </Button>

        <div className="relative flex-1 flex h-full items-center overflow-hidden">
          {canScrollLeft && (
            <button
              onClick={scrollLeft}
              className="z-20 absolute left-0 bg-muted h-full px-2 hover:bg-accent transition-colors"
              aria-label="Scroll left"
              style={{ boxShadow: "8px 0px 20px 0px rgba(0, 0, 0, 0.15)" }}
            >
              <ChevronLeft className="size-4" />
            </button>
          )}
          <div
            ref={scrollContainerRef}
            className="flex-1 flex items-center overflow-x-auto scrollbar-hide h-full"
          >
            {sessionTabs.map((tab) => (
              <SessionTabItem key={tab.pathname} pathname={tab.pathname} />
            ))}
          </div>
          {canScrollRight && (
            <button
              onClick={scrollRight}
              className="z-20 absolute right-0 bg-muted h-full px-2 hover:bg-accent transition-all"
              aria-label="Scroll right"
              style={{ boxShadow: "-8px 0px 20px 0px rgba(0, 0, 0, 0.15)" }}
            >
              <ChevronRight className="size-4" />
            </button>
          )}
        </div>
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

const ROUTE_TITLES: Record<string, string> = {
  [ROUTES.HOME]: "Home",
  [ROUTES.NOTES]: "Notes",
  [ROUTES.COLLECTIONS]: "Collections",
  [ROUTES.PROJECTS]: "Projects",
  [ROUTES.TASKS]: "Tasks",
};

function SessionTabItem({
  pathname,
  icon,
  className,
}: {
  pathname: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  const { activeTab, closeTab } = useSessionTabs();
  const { navigate } = useBrowserNavigate();
  const route = extractRoute(pathname);

  const active = activeTab?.pathname === pathname;

  // Only fetch data for parameterized routes
  const noteData = useGetNote(route.path === ROUTES.NOTE ? route.params.noteId : undefined);
  const collectionData = useGetCollection(
    route.path === ROUTES.COLLECTION ? route.params.collectionId : undefined
  );
  const projectData = useGetProject(
    route.path === ROUTES.PROJECT ? route.params.projectId : undefined
  );

  const title = useMemo(() => {
    // Static route titles
    if (route.path in ROUTE_TITLES) {
      return ROUTE_TITLES[route.path];
    }

    // Dynamic route titles
    if (route.path === ROUTES.NOTE) {
      return noteData.data?.title || NOTE_TITLE_FALLBACK;
    }
    if (route.path === ROUTES.COLLECTION) {
      return collectionData.data?.title || COLLECTION_TITLE_FALLBACK;
    }
    if (route.path === ROUTES.PROJECT) {
      return projectData.data?.title || PROJECT_TITLE_FALLBACK;
    }

    return "";
  }, [route.path, noteData.data?.title, collectionData.data?.title, projectData.data?.title]);

  return (
    <li
      className={cn(
        "group relative flex gap-1.5 items-center h-full px-3 cursor-pointer data-[active=false]:hover:bg-accent",
        "text-xs font-medium [&>svg]:size-3.5 text-foreground/90 border-b border-b-transparent",
        "data-[active=true]:bg-background data-[active=true]:border-b-primary data-[active=true]:text-primary transition-all duration-100",
        "max-w-48 min-w-24",
        className
      )}
      data-active={active}
      onClick={() => navigate(pathname)}
    >
      {icon}
      <span className="w-full truncate">{title}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          closeTab(pathname);
        }}
        className={cn(
          "absolute right-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-100",
          "h-full pr-2 pl-0.5 flex items-center justify-center",
          "bg-accent group-data-[active=true]:bg-background text-muted-foreground hover:text-foreground"
        )}
        aria-label="Close tab"
      >
        <X className="size-3.5" />
      </button>
    </li>
  );
}
