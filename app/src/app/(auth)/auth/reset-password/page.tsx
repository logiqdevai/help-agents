import type { Metadata } from "next";
import { Suspense } from "react";
import ResetPasswordPage from "@/views/auth/reset-password";

export const metadata: Metadata = { title: "Reset password" };

export default function Page() {
  return (
    <Suspense>
      <ResetPasswordPage />
    </Suspense>
  );
}
