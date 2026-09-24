import type { Metadata } from "next";
import { GuestGuard } from "@/components/providers/auth-guard";
import SignupPage from "@/views/auth/signup";

export const metadata: Metadata = { title: "Create your account" };

export default function Page() {
  return (
    <GuestGuard>
      <SignupPage />
    </GuestGuard>
  );
}
