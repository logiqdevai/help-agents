import type { Metadata } from "next";
import { VoiceAgentProduct } from "@/config/constants/products/voice-agent";
import { buildMarketingMetadata } from "@/lib/marketing-metadata";
import ProductPage from "@/views/products";

export const metadata: Metadata = buildMarketingMetadata({
  ...VoiceAgentProduct.seo,
  path: VoiceAgentProduct.href,
});

export default function Page() {
  return <ProductPage product={VoiceAgentProduct} />;
}
