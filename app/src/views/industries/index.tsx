import type { FC } from "react";
import { ControlPanel } from "@/components/marketing/control-panel";
import { FaqSection } from "@/components/marketing/faq-section";
import { FinalCta } from "@/components/marketing/final-cta";
import { PageStructuredData } from "@/components/marketing/page-structured-data";
import { ProductLinks } from "@/components/marketing/product-links";
import { StepsSection } from "@/components/marketing/steps-section";
import type { IndustryContent } from "@/config/constants/industries";
import { IndustryCapabilities } from "./components/industry-capabilities";
import { IndustryHero } from "./components/industry-hero";
import { IndustryPains } from "./components/industry-pains";
import { OtherIndustries } from "./components/other-industries";

const IndustryPage: FC<{ industry: IndustryContent }> = ({ industry }) => (
  <>
    <PageStructuredData
      path={industry.href}
      title={industry.seo.title}
      description={industry.seo.description}
      name={industry.name}
      entity={{
        type: "Service",
        name: industry.hero.title,
        category: `AI automation for ${industry.name.toLowerCase()}`,
      }}
      faqs={industry.faqs}
    />
    <IndustryHero industry={industry} />
    <IndustryPains industry={industry} />
    <IndustryCapabilities industry={industry} />
    <StepsSection title={industry.workflow.title} intro={industry.workflow.intro} steps={industry.workflow.steps} />
    <ControlPanel {...industry.control} orbs={industry.orbs} />
    <FaqSection faqs={industry.faqs} />
    <ProductLinks
      title="The three agents behind it"
      intro="Use one on its own, or let all three work on the same workflow."
    />
    <OtherIndustries currentSlug={industry.slug} />
    <FinalCta title={industry.cta.title} body={industry.cta.body} />
  </>
);

export default IndustryPage;
