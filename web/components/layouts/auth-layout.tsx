import React from "react";

import { AuthGuard } from "@/components/layouts/auth-guard";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard mustNotAuthenticated>{children}</AuthGuard>;
}
