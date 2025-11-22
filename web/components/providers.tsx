"use client";

import * as React from "react";

import { AuthGuardProvider } from "./layouts/auth-guard";
import { NavigationProvider } from "./navigation-provider";
import { QueryProvider } from "./query-provider";
import { ConfirmationProvider } from "./ui/confirmation-dialog";
import { Toaster } from "./ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ConfirmationProvider>
        <AuthGuardProvider>
          <NavigationProvider>
            {children}
            <Toaster />
          </NavigationProvider>
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
