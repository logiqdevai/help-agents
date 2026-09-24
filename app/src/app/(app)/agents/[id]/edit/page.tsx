import { Suspense } from "react";
import type { Metadata } from "next";
import { DetailSkeleton } from "@/components/ui/detail-skeleton";
import AgentEditPage from "@/views/agents/edit";

export const metadata: Metadata = { title: "Edit agent" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<DetailSkeleton cards={2} withTable={false} />}>
      <AgentEditPage id={id} />
    </Suspense>
  );
}
