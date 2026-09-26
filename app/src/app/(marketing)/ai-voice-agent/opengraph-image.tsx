import { VoiceAgentProduct } from "@/config/constants/products/voice-agent";
import { OgImageContentType, OgImageSize, renderOgImage } from "@/lib/og-image";

export const alt = VoiceAgentProduct.name;
export const size = OgImageSize;
export const contentType = OgImageContentType;

export default function OpenGraphImage() {
  return renderOgImage({
    headline: VoiceAgentProduct.hero.title,
    subline: VoiceAgentProduct.tagline,
  });
}
