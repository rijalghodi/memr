"use client";

import { ConfirmationProvider } from "./ui/confirmation-dialog";
import { Toaster } from "./ui/sonner";
import * as React from "react";
import { AuthGuardProvider } from "./layouts/auth-guard";
import { QueryProvider } from "./query-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ConfirmationProvider>
        <AuthGuardProvider>
          {children}
          <Toaster />
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
