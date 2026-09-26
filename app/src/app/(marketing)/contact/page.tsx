import type { Metadata } from "next";
import { ContactSeo } from "@/config/constants/contact";
import { buildMarketingMetadata } from "@/lib/marketing-metadata";
import { Routes } from "@/routes/routes";
import ContactPage from "@/views/contact";

export const metadata: Metadata = buildMarketingMetadata({ ...ContactSeo, path: Routes.marketing.contact });

export default function Page() {
  return <ContactPage />;
}
