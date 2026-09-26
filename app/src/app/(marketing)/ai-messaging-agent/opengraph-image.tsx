import { MessagingAgentProduct } from "@/config/constants/products/messaging-agent";
import { OgImageContentType, OgImageSize, renderOgImage } from "@/lib/og-image";

export const alt = MessagingAgentProduct.name;
export const size = OgImageSize;
export const contentType = OgImageContentType;

export default function OpenGraphImage() {
  return renderOgImage({
    headline: MessagingAgentProduct.hero.title,
    subline: MessagingAgentProduct.tagline,
  });
}
