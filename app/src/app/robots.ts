import type { MetadataRoute } from "next";
import { environments } from "@/config/environments";
import { Routes } from "@/routes/routes";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/auth/",
        "/invitations/",
        Routes.dashboard,
        Routes.agents.root,
        Routes.calls.root,
        Routes.knowledge.root,
        Routes.integrations.root,
        Routes.phoneNumbers,
        Routes.analytics,
        Routes.alerts,
        Routes.activityLog,
        Routes.settings.root,
      ],
    },
    sitemap: `${environments.siteUrl}/sitemap.xml`,
  };
}
