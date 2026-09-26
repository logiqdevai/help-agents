import type { LucideIcon } from "lucide-react";
import type { FaqItem, RunLedgerContent } from "@/interfaces/marketing.interfaces";

export const IndustrySlugs = {
  realEstate: "real-estate",
  sales: "sales",
  customerSupport: "customer-support",
  recruitment: "recruitment",
  professionalServices: "professional-services",
} as const;
export type IndustrySlug = (typeof IndustrySlugs)[keyof typeof IndustrySlugs];

export const IndustryChannels = {
  voice: "Voice",
  email: "Email",
  messaging: "Messaging",
  crm: "CRM",
} as const;
export type IndustryChannel = (typeof IndustryChannels)[keyof typeof IndustryChannels];

export type IndustryOrbColor = "mint" | "peach" | "lavender" | "sky" | "rose";

export interface IndustryTextItem {
  title: string;
  body: string;
}

export interface IndustryCapability extends IndustryTextItem {
  icon: LucideIcon;
  channel: IndustryChannel;
}

export interface IndustrySystem extends IndustryTextItem {
  icon: LucideIcon;
}

export interface IndustryContent {
  slug: IndustrySlug;
  /** Short name used in links and breadcrumbs. */
  name: string;
  href: string;
  /** Two soft orbs behind the hero. */
  orbs: [IndustryOrbColor, IndustryOrbColor];
  seo: { title: string; description: string };
  hero: { title: string; lead: string; support: string; stack: string[] };
  ledger: RunLedgerContent;
  pains: { title: string; intro: string; items: IndustryTextItem[] };
  capabilities: { title: string; intro: string; items: IndustryCapability[] };
  workflow: { title: string; intro: string; steps: IndustryTextItem[] };
  systems: { title: string; intro: string; items: IndustrySystem[] };
  control: { title: string; intro: string; items: string[]; closing: string };
  faqs: FaqItem[];
  cta: { title: string; body: string };
}
