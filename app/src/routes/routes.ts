// Centralized frontend paths — used as <Link href>, router.push(), and redirect() targets.
// Auth + invitation paths must match the links the API puts in emails (api/src/shared/config/app-urls).
export const Routes = {
  /** Public marketing landing page. */
  home: "/",
  dashboard: "/dashboard",
  /** Public marketing pages (hub-and-spoke SEO: platform, then products, then industries). */
  marketing: {
    voiceAgent: "/ai-voice-agent",
    emailAgent: "/ai-email-agent",
    messagingAgent: "/ai-messaging-agent",
    useCases: "/use-cases",
    industries: {
      realEstate: "/industries/real-estate",
      sales: "/industries/sales",
      customerSupport: "/industries/customer-support",
      recruitment: "/industries/recruitment",
      professionalServices: "/industries/professional-services",
    },
    /** In-page anchors on the landing page. */
    sections: {
      solutions: "/#solutions",
      howItWorks: "/#how-it-works",
      useCases: "/#use-cases",
      integrations: "/#integrations",
      faq: "/#faq",
    },
  },
  auth: {
    login: "/auth/login",
    signup: "/auth/signup",
    verifyEmail: "/auth/verify-email",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
  },
  invitations: {
    accept: "/invitations/accept",
  },
  alerts: "/alerts",
  analytics: "/analytics",
  agents: {
    root: "/agents",
    create: "/agents/new",
    /** Continue the setup of a draft agent. */
    resume: (id: string) => `/agents/new?agent=${id}`,
    /** Start a new agent pre-filled from a use-case template. */
    fromTemplate: (templateId: string) => `/agents/new?template=${templateId}`,
    detail: (id: string) => `/agents/${id}`,
    /** Opens the edit page, optionally on one of its tabs (see AgentEditTabOptions). */
    edit: (id: string, tab?: string) => (tab ? `/agents/${id}/edit?tab=${tab}` : `/agents/${id}/edit`),
  },
  calls: {
    root: "/calls",
    detail: (id: string) => `/calls/${id}`,
    scheduled: "/calls/scheduled",
  },
  knowledge: {
    root: "/knowledge",
    create: "/knowledge/new",
    detail: (id: string) => `/knowledge/${id}`,
  },
  integrations: {
    root: "/integrations",
    create: "/integrations/new",
    detail: (id: string) => `/integrations/${id}`,
    // Where the API's OAuth callback lands the browser after the provider consent screen.
    oauthCallback: "/integrations/oauth/callback",
  },
  phoneNumbers: "/phone-numbers",
  activityLog: "/activity-log",
  settings: {
    root: "/settings",
    organization: "/settings/organization",
    team: "/settings/team",
    security: "/settings/security",
    account: "/settings/account",
  },
} as const;
