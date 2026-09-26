import type { MetadataRoute } from "next";
import { environments } from "@/config/environments";

// Only the pages that exist and are public. Add the product and industry pages here as they are built.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: environments.siteUrl, changeFrequency: "monthly", priority: 1 }];
}
