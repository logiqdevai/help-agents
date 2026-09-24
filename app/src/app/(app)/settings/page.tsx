import { redirect } from "next/navigation";
import { Routes } from "@/routes/routes";

export default function SettingsPage() {
  redirect(Routes.settings.organization);
}
