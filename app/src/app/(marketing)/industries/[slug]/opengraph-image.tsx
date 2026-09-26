import { Industries, getIndustry } from "@/config/constants/industries";
import { OgImageContentType, OgImageSize, renderOgImage } from "@/lib/og-image";

export const alt = "AI agents for your industry";
export const size = OgImageSize;
export const contentType = OgImageContentType;

export function generateStaticParams() {
  return Industries.map((industry) => ({ slug: industry.slug }));
}

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const industry = getIndustry(slug);
  return renderOgImage({
    headline: industry?.hero.title ?? "AI agents that work for your business",
    subline: industry ? industry.hero.stack.join(" + ") : "Voice. Email. Viber.",
  });
}
