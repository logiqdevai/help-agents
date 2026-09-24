import type { Metadata } from "next";
import CallsPage from "@/views/calls";

export const metadata: Metadata = { title: "Calls" };

export default function Page() {
  return <CallsPage />;
}
