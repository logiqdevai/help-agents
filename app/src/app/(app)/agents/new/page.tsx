import { Suspense } from "react";
import type { Metadata } from "next";
import NewAgentPage from "@/views/agents/new";

export const metadata: Metadata = { title: "Create agent" };

export default function Page() {
  return (
    <Suspense>
      <NewAgentPage />
    </Suspense>
  );
}
