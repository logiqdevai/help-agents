import type { Metadata } from "next";
import ActivityLogPage from "@/views/activity-log";

export const metadata: Metadata = { title: "Activity log" };

export default function Page() {
  return <ActivityLogPage />;
}
