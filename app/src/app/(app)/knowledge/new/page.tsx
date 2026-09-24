import type { Metadata } from "next";
import NewKnowledgePage from "@/views/knowledge/new";

export const metadata: Metadata = { title: "Add knowledge" };

export default function Page() {
  return <NewKnowledgePage />;
}
