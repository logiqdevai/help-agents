// Centralized frontend paths — used as <Link href>, router.push(), and redirect() targets.
export const Routes = {
  home: "/",
  agents: {
    root: "/agents",
    create: "/agents/new",
  },
  calls: "/calls",
  knowledge: "/knowledge",
  integrations: "/integrations",
  phoneNumbers: "/phone-numbers",
  analytics: "/analytics",
  settings: "/settings",
} as const;
