export const environments = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api",
  /** Public origin of this site: canonical URLs, Open Graph and the sitemap. */
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001").replace(/\/$/, ""),
} as const;
