"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";

export type SessionTab = {
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

type NavigationContextValue = {
  // Navigation
  canGoBack: boolean;
  canGoForward: boolean;
  navigate: (pathname: string) => void;
  goBack: () => void;
  goForward: () => void;
  // Session Tabs
  pathname: string;
  sessionTabs: SessionTab[];
  activeTab: SessionTab | null;
  closeTab: (pathname: string) => void;
  closeAllTabs: () => void;
};

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  // Session Tabs State
  const [sessionTabs, setSessionTabs] = useState<SessionTab[]>(() =>
    loadTabsFromStorage()
  );

  // Browser Navigation State
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const historyStackRef = useRef<string[]>([pathname]);
  const currentIndexRef = useRef(0);
  const isNavigatingRef = useRef(false);

  // Sync tabs to localStorage whenever tabs change
  useEffect(() => {
    saveTabsToStorage(sessionTabs);
  }, [sessionTabs]);

  // Determine active tab based on current pathname
  const activeTab =
    sessionTabs.find((tab) => tab.pathname === pathname) || null;

  // Add tab to session tabs
  const addTab = useCallback((pathname: string) => {
    setSessionTabs((prevTabs) => {
      // Check if pathname already exists - replace it
      const existingIndex = prevTabs.findIndex(
        (tab) => tab.pathname === pathname
      );

      const newTab: SessionTab = {
        pathname,
      };

      if (existingIndex !== -1) {
        // Replace existing tab
        const newTabs = [...prevTabs];
        newTabs[existingIndex] = newTab;
        return newTabs;
      }

      // Add new tab at the end
      return [...prevTabs, newTab];
    });
  }, []);

  // Update can navigate state
  const updateCanNavigate = useCallback(() => {
    const currentIndex = currentIndexRef.current;
    const maxIndex = historyStackRef.current.length - 1;
    setCanGoBack(currentIndex > 0);
    setCanGoForward(currentIndex < maxIndex);
  }, []);

  const closeTab = useCallback(
    (pathname: string) => {
      // Remove from session tabs
      setSessionTabs((prevTabs) => {
        return prevTabs.filter((tab) => tab.pathname !== pathname);
      });

      // Remove from navigation stack
      const stack = historyStackRef.current;
      const indexToRemove = stack.findIndex((path) => path === pathname);
      if (indexToRemove !== -1) {
        const newStack = stack.filter((_, index) => index !== indexToRemove);
        historyStackRef.current = newStack;

        // Adjust current index if needed
        if (currentIndexRef.current >= indexToRemove) {
          currentIndexRef.current = Math.max(0, currentIndexRef.current - 1);
        } else if (currentIndexRef.current > newStack.length - 1) {
          currentIndexRef.current = newStack.length - 1;
        }

        updateCanNavigate();
      }
    },
    [updateCanNavigate]
  );

  const closeAllTabs = useCallback(() => {
    // Clear session tabs
    setSessionTabs([]);

    // Reset navigation stack to current pathname only
    historyStackRef.current = [pathname];
    currentIndexRef.current = 0;
    updateCanNavigate();
  }, [pathname, updateCanNavigate]);

  // Navigate handler - adds to both session tabs and history
  const handleNavigate = useCallback(
    (pathname: string) => {
      isNavigatingRef.current = true;
      const currentIndex = currentIndexRef.current;
      const stack = historyStackRef.current;

      // Remove any forward history if we're navigating from middle of stack
      historyStackRef.current = stack.slice(0, currentIndex + 1);
      historyStackRef.current.push(pathname);
      currentIndexRef.current = historyStackRef.current.length - 1;

      // Add to session tabs (stored in localStorage)
      addTab(pathname);

      // Navigate using react-router
      navigate(pathname);
      updateCanNavigate();
    },
    [navigate, updateCanNavigate, addTab]
  );

  const handleGoBack = useCallback(() => {
    const currentIndex = currentIndexRef.current;
    if (currentIndex > 0) {
      isNavigatingRef.current = true;
      currentIndexRef.current = Math.max(0, currentIndex - 1);
      navigate(-1);
      updateCanNavigate();
    }
  }, [navigate, updateCanNavigate]);

  const handleGoForward = useCallback(() => {
    const currentIndex = currentIndexRef.current;
    const maxIndex = historyStackRef.current.length - 1;
    if (currentIndex < maxIndex) {
      isNavigatingRef.current = true;
      currentIndexRef.current = Math.min(maxIndex, currentIndex + 1);
      navigate(1);
      updateCanNavigate();
    }
  }, [navigate, updateCanNavigate]);

  // Track browser history state
  useEffect(() => {
    const handlePopState = () => {
      const currentPath = location.pathname;
      const stack = historyStackRef.current;
      const currentIndex = stack.findIndex((path) => path === currentPath);

      if (currentIndex !== -1) {
        currentIndexRef.current = currentIndex;
      }

      isNavigatingRef.current = false;
      updateCanNavigate();
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [location.pathname, updateCanNavigate]);

  // Track navigation to determine if we can go back/forward
  useEffect(() => {
    if (!isNavigatingRef.current) {
      const currentPath = location.pathname;
      const stack = historyStackRef.current;
      const currentIndex = stack.findIndex((path) => path === currentPath);

      if (currentIndex === -1) {
        // New path not in stack, add it
        historyStackRef.current.push(currentPath);
        currentIndexRef.current = historyStackRef.current.length - 1;
      } else {
        currentIndexRef.current = currentIndex;
      }
    }

    isNavigatingRef.current = false;
    updateCanNavigate();
  }, [location.pathname, updateCanNavigate]);

  return (
    <NavigationContext.Provider
      value={{
        canGoBack,
        canGoForward,
        navigate: handleNavigate,
        goBack: handleGoBack,
        goForward: handleGoForward,
        pathname,
        sessionTabs,
        activeTab,
        closeTab,
        closeAllTabs,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

// Single hook for navigation
export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}

// Backward compatibility hooks
export function useSessionTabs() {
  return useNavigation();
}

export function useBrowserNavigate() {
  return useNavigation();
}
