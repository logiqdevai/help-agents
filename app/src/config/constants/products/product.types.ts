import type { LucideIcon } from "lucide-react";
import type { FaqItem, MarketingTextItem, OrbColorName, RunLedgerContent } from "@/interfaces/marketing.interfaces";
import type { IndustrySlug } from "@/config/constants/industries";

export const ProductSlugs = {
  voice: "voice",
  email: "email",
  messaging: "messaging",
} as const;
export type ProductSlug = (typeof ProductSlugs)[keyof typeof ProductSlugs];

export interface ProductCapability extends MarketingTextItem {
  icon: LucideIcon;
}

export interface ProductContrastRow {
  before: string;
  after: string;
}

export interface ProductIndustryUse {
  slug: IndustrySlug;
  body: string;
}

export interface ProductContent {
  slug: ProductSlug;
  /** Full product name, e.g. "AI voice agent". */
  name: string;
  /** One-line description used when the product is linked from other pages. */
  tagline: string;
  href: string;
  icon: LucideIcon;
  orbs: [OrbColorName, OrbColorName];
  seo: { title: string; description: string };
  hero: { title: string; lead: string; support: string };
  definition: {
    title: string;
    paragraphs: string[];
    contrastTitle: string;
    beforeLabel: string;
    afterLabel: string;
    rows: ProductContrastRow[];
  };
  capabilities: { title: string; intro: string; items: ProductCapability[] };
  example: { title: string; intro: string; ledger: RunLedgerContent };
  setup: { title: string; intro: string; steps: MarketingTextItem[] };
  control: { title: string; intro: string; items: string[]; closing: string };
  industries: { title: string; intro: string; items: ProductIndustryUse[] };
  faqs: FaqItem[];
  cta: { title: string; body: string };
}
