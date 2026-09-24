import type { Metadata } from "next";
import KnowledgePage from "@/views/knowledge";

export const metadata: Metadata = { title: "Knowledge" };

export default function Page() {
  return <KnowledgePage />;
}
