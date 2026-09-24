import type { Metadata } from "next";
import AccountSettingsPage from "@/views/settings/account";

export const metadata: Metadata = { title: "Account settings" };

export default function Page() {
  return <AccountSettingsPage />;
}
