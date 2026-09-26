import type { MetadataRoute } from "next";
import { Industries } from "@/config/constants/industries";
import { Products } from "@/config/constants/products";
import { environments } from "@/config/environments";
import { Routes } from "@/routes/routes";

// Only pages that exist and are public. Add new marketing pages here as they are built.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: environments.siteUrl, changeFrequency: "monthly", priority: 1 },
    { url: `${environments.siteUrl}${Routes.marketing.contact}`, changeFrequency: "yearly", priority: 0.7 },
    ...Products.map((product) => ({
      url: `${environments.siteUrl}${product.href}`,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    ...Industries.map((industry) => ({
      url: `${environments.siteUrl}${industry.href}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
