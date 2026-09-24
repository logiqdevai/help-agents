import type { Metadata } from "next";
import { Suspense } from "react";
import VerifyEmailPage from "@/views/auth/verify-email";

export const metadata: Metadata = { title: "Verify your email" };

export default function Page() {
  return (
    <Suspense>
      <VerifyEmailPage />
    </Suspense>
  );
}
