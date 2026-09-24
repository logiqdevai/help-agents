import type { Metadata } from "next";
import KnowledgeDetailPage from "@/views/knowledge/detail";

export const metadata: Metadata = { title: "Knowledge source" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <KnowledgeDetailPage id={id} />;
}
