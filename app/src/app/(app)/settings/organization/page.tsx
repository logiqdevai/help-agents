import type { Metadata } from "next";
import OrganizationSettingsPage from "@/views/settings/organization";

export const metadata: Metadata = { title: "Organization settings" };

export default function Page() {
  return <OrganizationSettingsPage />;
}
