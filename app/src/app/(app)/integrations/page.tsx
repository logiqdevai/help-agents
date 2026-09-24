import type { Metadata } from "next";
import IntegrationsPage from "@/views/integrations/list";

export const metadata: Metadata = { title: "Integrations" };

export default function Page() {
  return <IntegrationsPage />;
}
