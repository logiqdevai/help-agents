import type { Metadata } from "next";
import AnalyticsPage from "@/views/analytics";

export const metadata: Metadata = { title: "Usage reports" };

export default function Page() {
  return <AnalyticsPage />;
}
