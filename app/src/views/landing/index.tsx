import type { FC } from "react";
import { BuiltAround } from "./components/built-around";
import { FaqSection } from "@/components/marketing/faq-section";
import { FinalCta } from "@/components/marketing/final-cta";
import { LandingFaqs, LandingFinalCta } from "@/config/constants/landing";
import { Hero } from "./components/hero";
import { HowItWorks } from "./components/how-it-works";
import { Solutions } from "./components/solutions";
import { LandingStructuredData } from "./components/structured-data";
import { UseCases } from "./components/use-cases";

const LandingPage: FC = () => (
  <>
    <LandingStructuredData />
    <Hero />
    <Solutions />
    <HowItWorks />
    <UseCases />
    <BuiltAround />
    <FaqSection faqs={LandingFaqs} />
    <FinalCta title={LandingFinalCta.title} body={LandingFinalCta.body} />
  </>
);

export default LandingPage;
