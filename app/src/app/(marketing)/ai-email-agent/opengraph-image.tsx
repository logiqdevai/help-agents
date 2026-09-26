import { EmailAgentProduct } from "@/config/constants/products/email-agent";
import { OgImageContentType, OgImageSize, renderOgImage } from "@/lib/og-image";

export const alt = EmailAgentProduct.name;
export const size = OgImageSize;
export const contentType = OgImageContentType;

export default function OpenGraphImage() {
  return renderOgImage({
    headline: EmailAgentProduct.hero.title,
    subline: EmailAgentProduct.tagline,
  });
}
