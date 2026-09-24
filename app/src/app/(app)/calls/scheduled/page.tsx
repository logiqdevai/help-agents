import type { Metadata } from "next";
import ScheduledCallsPage from "@/views/calls/scheduled";

export const metadata: Metadata = { title: "Scheduled calls" };

export default function Page() {
  return <ScheduledCallsPage />;
}
