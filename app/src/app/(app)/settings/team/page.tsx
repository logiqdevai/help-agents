import type { Metadata } from "next";
import TeamSettingsPage from "@/views/settings/team";

export const metadata: Metadata = { title: "Team settings" };

export default function Page() {
  return <TeamSettingsPage />;
}
