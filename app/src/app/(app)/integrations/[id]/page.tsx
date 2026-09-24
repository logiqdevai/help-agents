import type { Metadata } from "next";
import IntegrationDetailPage from "@/views/integrations/detail";

export const metadata: Metadata = { title: "Integration" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <IntegrationDetailPage id={id} />;
}
