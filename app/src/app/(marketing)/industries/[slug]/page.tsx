import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Industries, getIndustry } from "@/config/constants/industries";
import { buildMarketingMetadata } from "@/lib/marketing-metadata";
import IndustryPage from "@/views/industries";

export const dynamicParams = false;

export function generateStaticParams() {
  return Industries.map((industry) => ({ slug: industry.slug }));
}

export async function generateMetadata({ params }: PageProps<"/industries/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) return {};
  return buildMarketingMetadata({ ...industry.seo, path: industry.href });
}

export default async function Page({ params }: PageProps<"/industries/[slug]">) {
  const { slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) notFound();
  return <IndustryPage industry={industry} />;
}
