import type { Metadata } from "next";
import { APP_NAME } from "@/config/constants/app";

interface MarketingMetadataInput {
  title: string;
  description: string;
  /** Path of the page, used for the canonical URL and Open Graph URL. */
  path: string;
}

/** Title, description, canonical, Open Graph, Twitter and robots for an indexable marketing page. */
export function buildMarketingMetadata({ title, description, path }: MarketingMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", url: path, siteName: APP_NAME, title, description, locale: "en_US" },
    twitter: { card: "summary_large_image", title, description },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
  };
}
