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

import { useSessionTabs } from "./session-tabs";

type BrowserNavigationContextValue = {
  canGoBack: boolean;
  canGoForward: boolean;
  navigate: (pathname: string, title?: string) => void;
  goBack: () => void;
  goForward: () => void;
};

const BrowserNavigationContext =
  createContext<BrowserNavigationContextValue | null>(null);

export function useBrowserNavigate() {
  const context = useContext(BrowserNavigationContext);
  if (!context) {
    throw new Error(
      "useBrowserNavigation must be used within BrowserNavigationProvider",
    );
  }
  return context;
}

export function BrowserNavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const { addTab } = useSessionTabs();
  const location = useLocation();
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const historyStackRef = useRef<string[]>([location.pathname]);
  const currentIndexRef = useRef(0);
  const isNavigatingRef = useRef(false);

  const updateCanNavigate = useCallback(() => {
    const currentIndex = currentIndexRef.current;
    const maxIndex = historyStackRef.current.length - 1;
    setCanGoBack(currentIndex > 0);
    setCanGoForward(currentIndex < maxIndex);
  }, []);

  const handleNavigate = useCallback(
    (pathname: string, title?: string) => {
      isNavigatingRef.current = true;
      const currentIndex = currentIndexRef.current;
      const stack = historyStackRef.current;

      // Remove any forward history if we're navigating from middle of stack
      historyStackRef.current = stack.slice(0, currentIndex + 1);
      historyStackRef.current.push(pathname);
      currentIndexRef.current = historyStackRef.current.length - 1;

      navigate(pathname);
      if (title) {
        addTab({
          title,
          pathname,
        });
      }
      updateCanNavigate();
    },
    [navigate, updateCanNavigate, addTab],
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
    <BrowserNavigationContext.Provider
      value={{
        canGoBack,
        canGoForward,
        navigate: handleNavigate,
        goBack: handleGoBack,
        goForward: handleGoForward,
      }}
    >
      {children}
    </BrowserNavigationContext.Provider>
  );
}
