import type { Metadata } from "next";
import SecuritySettingsPage from "@/views/settings/security";

export const metadata: Metadata = { title: "Security settings" };

export default function Page() {
  return <SecuritySettingsPage />;
}
