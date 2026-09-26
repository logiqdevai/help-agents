import type { Metadata } from "next";
import { AuthGuard } from "@/components/providers/auth-guard";
import { AppShell } from "@/components/layout/app-shell";

// The signed-in app is private; only the marketing pages are indexed.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
