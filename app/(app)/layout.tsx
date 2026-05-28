import { AuthGuard } from "@/components/auth/auth-guard";
import type { ReactNode } from "react";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
