import type { FC } from "react";
import { Benefits } from "./components/benefits";
import { BuiltAround } from "./components/built-around";
import { ConnectedAi } from "./components/connected-ai";
import { Expansion } from "./components/expansion";
import { Faq } from "./components/faq";
import { FinalCta } from "./components/final-cta";
import { Hero } from "./components/hero";
import { HowItWorks } from "./components/how-it-works";
import { Integrations } from "./components/integrations";
import { Solutions } from "./components/solutions";
import { LandingStructuredData } from "./components/structured-data";
import { SupportingStatement } from "./components/supporting-statement";
import { UseCases } from "./components/use-cases";

const LandingPage: FC = () => (
  <>
    <LandingStructuredData />
    <Hero />
    <SupportingStatement />
    <Solutions />
    <HowItWorks />
    <ConnectedAi />
    <UseCases />
    <Integrations />
    <BuiltAround />
    <Expansion />
    <Benefits />
    <Faq />
    <FinalCta />
  </>
);

export default LandingPage;
