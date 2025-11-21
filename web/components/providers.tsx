"use client";

import * as React from "react";

import { BrowserNavigationProvider } from "./browser-navigation";
import { AuthGuardProvider } from "./layouts/auth-guard";
import { QueryProvider } from "./query-provider";
import { SessionTabsProvider } from "./session-tabs";
import { ConfirmationProvider } from "./ui/confirmation-dialog";
import { Toaster } from "./ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ConfirmationProvider>
        <AuthGuardProvider>
          <SessionTabsProvider>
            <BrowserNavigationProvider>
              {children}
              <Toaster />
            </BrowserNavigationProvider>
          </SessionTabsProvider>
        </AuthGuardProvider>
      </ConfirmationProvider>
      {/* <NextThemesProvider
        attribute="class"
        defaultTheme="light"
        themes={["light", "dark"]}
        enableSystem={false}
        disableTransitionOnChange={false}
        enableColorScheme
      ></NextThemesProvider> */}
    </QueryProvider>
  );
}
