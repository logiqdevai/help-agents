import type { Metadata } from "next";
import { EmailAgentProduct } from "@/config/constants/products/email-agent";
import { buildMarketingMetadata } from "@/lib/marketing-metadata";
import ProductPage from "@/views/products";

export const metadata: Metadata = buildMarketingMetadata({
  ...EmailAgentProduct.seo,
  path: EmailAgentProduct.href,
});

export default function Page() {
  return <ProductPage product={EmailAgentProduct} />;
}
