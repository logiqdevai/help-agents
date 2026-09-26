import type { Metadata } from "next";
import { MessagingAgentProduct } from "@/config/constants/products/messaging-agent";
import { buildMarketingMetadata } from "@/lib/marketing-metadata";
import ProductPage from "@/views/products";

export const metadata: Metadata = buildMarketingMetadata({
  ...MessagingAgentProduct.seo,
  path: MessagingAgentProduct.href,
});

export default function Page() {
  return <ProductPage product={MessagingAgentProduct} />;
}
