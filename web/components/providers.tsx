"use client";

import * as React from "react";

import { AuthGuardProvider } from "./layouts/auth-guard";
import { QueryProvider } from "./query-provider";
import { ConfirmationProvider } from "./ui/confirmation-dialog";
import { Toaster } from "./ui/sonner";
import { SessionTabsProvider } from "./session-tabs";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ConfirmationProvider>
        <AuthGuardProvider>
          <SessionTabsProvider>
            {children}
            <Toaster />
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
