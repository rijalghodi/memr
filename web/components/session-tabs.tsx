"use client";

import { usePathname } from "next/navigation";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type SessionTab = {
  id: string;
  title: string;
  pathname: string;
};

const STORAGE_KEY = "memr.sessionTabs";

function loadTabsFromStorage(): SessionTab[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as SessionTab[];
  } catch {
    return [];
  }
}

function saveTabsToStorage(tabs: SessionTab[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
  } catch {
    // Ignore storage errors
  }
}

type SessionTabsContextValue = {
  sessionTabs: SessionTab[];
  activeTab: SessionTab | null;
  pathname: string;
  setActiveTab: (id: string) => void;
  addTab: (params: {
    title: string;
    pathname: string;
    position?: number;
  }) => void;
  updateTabTitle: (pathname: string, title: string) => void;
  closeTab: (id: string) => void;
  closeAllTabs: () => void;
};

export const SessionTabsContext = createContext<SessionTabsContextValue | null>(
  null,
);

export function SessionTabsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sessionTabs, setSessionTabs] = useState<SessionTab[]>(() =>
    loadTabsFromStorage(),
  );

  // Sync to localStorage whenever tabs change
  useEffect(() => {
    saveTabsToStorage(sessionTabs);
  }, [sessionTabs]);

  // Determine active tab based on current pathname
  const activeTab =
    sessionTabs.find((tab) => tab.pathname === pathname) || null;

  const setActiveTab = useCallback(
    (id: string) => {
      // This function can be used to programmatically set active tab
      // In practice, activeTab is determined by pathname, so this might
      // be used for navigation purposes
      const tab = sessionTabs.find((t) => t.id === id);
      if (tab) {
        // Navigation would be handled by the component using router
        // This function exists for API completeness
      }
    },
    [sessionTabs],
  );

  const addTab = useCallback(
    ({
      title,
      pathname,
      position,
    }: {
      title: string;
      pathname: string;
      position?: number;
    }) => {
      setSessionTabs((prevTabs) => {
        // Check if pathname already exists - replace it
        const existingIndex = prevTabs.findIndex(
          (tab) => tab.pathname === pathname,
        );

        const newTab: SessionTab = {
          id: crypto.randomUUID(),
          title,
          pathname,
        };

        if (existingIndex !== -1) {
          // Replace existing tab
          const newTabs = [...prevTabs];
          newTabs[existingIndex] = newTab;
          return newTabs;
        }

        // Add new tab
        const newTabs = [...prevTabs];
        if (position !== undefined && position >= 0) {
          // Insert at specific position
          newTabs.splice(position, 0, newTab);
        } else if (position === -1 || position === undefined) {
          // Append to end
          newTabs.push(newTab);
        } else {
          // Negative position: insert from end
          newTabs.splice(newTabs.length + position + 1, 0, newTab);
        }
        return newTabs;
      });
    },
    [],
  );

  const updateTabTitle = useCallback((pathname: string, title: string) => {
    setSessionTabs((prevTabs) => {
      return prevTabs.map((tab) =>
        tab.pathname === pathname ? { ...tab, title } : tab,
      );
    });
  }, []);

  const closeTab = useCallback((id: string) => {
    setSessionTabs((prevTabs) => {
      return prevTabs.filter((tab) => tab.id !== id);
    });
  }, []);

  const closeAllTabs = useCallback(() => {
    setSessionTabs([]);
  }, []);

  return (
    <SessionTabsContext.Provider
      value={{
        sessionTabs,
        activeTab,
        pathname,
        setActiveTab,
        addTab,
        updateTabTitle,
        closeTab,
        closeAllTabs,
      }}
    >
      {children}
    </SessionTabsContext.Provider>
  );
}

export function useSessionTabs() {
  const context = useContext(SessionTabsContext);
  if (!context) {
    throw new Error("useSessionTabs must be used within a SessionTabsProvider");
  }
  return context;
}
