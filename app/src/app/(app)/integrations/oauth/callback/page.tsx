import { Suspense } from "react";
import type { Metadata } from "next";
import IntegrationOAuthCallbackPage from "@/views/integrations/oauth-callback";

export const metadata: Metadata = { title: "Connecting" };

export default function Page() {
  return (
    <Suspense>
      <IntegrationOAuthCallbackPage />
    </Suspense>
  );
}
