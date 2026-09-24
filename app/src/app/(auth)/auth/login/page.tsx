import type { Metadata } from "next";
import { GuestGuard } from "@/components/providers/auth-guard";
import LoginPage from "@/views/auth/login";

export const metadata: Metadata = { title: "Log in" };

export default function Page() {
  return (
    <GuestGuard>
      <LoginPage />
    </GuestGuard>
  );
}
