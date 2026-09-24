import { Suspense } from "react";
import type { Metadata } from "next";
import NewIntegrationPage from "@/views/integrations/new";

export const metadata: Metadata = { title: "Connect a CRM" };

export default function Page() {
  return (
    <Suspense>
      <NewIntegrationPage />
    </Suspense>
  );
}
