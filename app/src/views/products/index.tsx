import type { FC } from "react";
import { ControlPanel } from "@/components/marketing/control-panel";
import { FaqSection } from "@/components/marketing/faq-section";
import { FinalCta } from "@/components/marketing/final-cta";
import { PageStructuredData } from "@/components/marketing/page-structured-data";
import { ProductLinks } from "@/components/marketing/product-links";
import { StepsSection } from "@/components/marketing/steps-section";
import type { ProductContent } from "@/config/constants/products";
import { ProductCapabilities } from "./components/product-capabilities";
import { ProductDefinition } from "./components/product-definition";
import { ProductExample } from "./components/product-example";
import { ProductHero } from "./components/product-hero";
import { ProductIndustries } from "./components/product-industries";

const ProductPage: FC<{ product: ProductContent }> = ({ product }) => (
  <>
    <PageStructuredData
      path={product.href}
      title={product.seo.title}
      description={product.seo.description}
      name={product.name}
      entity={{ type: "SoftwareApplication", name: product.name, category: "BusinessApplication" }}
      faqs={product.faqs}
    />
    <ProductHero product={product} />
    <ProductDefinition product={product} />
    <ProductCapabilities product={product} />
    <ProductExample product={product} />
    <StepsSection title={product.setup.title} intro={product.setup.intro} steps={product.setup.steps} />
    <ControlPanel {...product.control} orbs={product.orbs} />
    <ProductIndustries product={product} />
    <FaqSection faqs={product.faqs} />
    <ProductLinks
      title="Use it alongside the other AI agents"
      intro="Voice, email and messaging agents share the same knowledge and connected systems, so one workflow can use all three."
      exclude={product.slug}
    />
    <FinalCta title={product.cta.title} body={product.cta.body} />
  </>
);

export default ProductPage;
