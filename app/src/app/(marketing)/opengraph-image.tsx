import { LandingSeo } from "@/config/constants/landing";
import { OgImageContentType, OgImageSize, renderOgImage } from "@/lib/og-image";

export const alt = LandingSeo.ogAlt;
export const size = OgImageSize;
export const contentType = OgImageContentType;

export default function OpenGraphImage() {
  return renderOgImage({
    headline: "AI agents that handle your calls, emails and messages",
    subline: "Connected to your CRM. Working by your rules.",
  });
}
