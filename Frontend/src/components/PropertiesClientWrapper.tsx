"use client";

import { RequireAuth } from "@/components/require-auth";

/** Properties listing gate — same auth flow as AuthInit + RequireAuth */
export function PropertiesClientWrapper({ children }: { children: React.ReactNode }) {
  return <RequireAuth redirectTo="/properties">{children}</RequireAuth>;
}
