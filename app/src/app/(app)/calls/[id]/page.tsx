import type { Metadata } from "next";
import CallDetailPage from "@/views/calls/detail";

export const metadata: Metadata = { title: "Call details" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CallDetailPage id={id} />;
}
