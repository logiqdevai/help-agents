import type { Metadata } from "next";
import { Suspense } from "react";
import InviteAcceptPage from "@/views/auth/invite-accept";

export const metadata: Metadata = { title: "Accept invitation" };

export default function Page() {
  return (
    <Suspense>
      <InviteAcceptPage />
    </Suspense>
  );
}
