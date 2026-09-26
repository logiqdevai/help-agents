import { Container } from "@/components/marketing/container";
import { CtaLink } from "@/components/marketing/cta-link";
import { Orb } from "@/components/marketing/orb";
import { RunLedger } from "@/components/marketing/run-ledger";
import { LandingLedger } from "@/config/constants/landing";
import { environments } from "@/config/environments";
import { Routes } from "@/routes/routes";

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      <Orb color="mint" drift className="-top-32 -right-24 size-[520px]" />
      <Orb color="peach" drift className="top-40 right-[22%] size-[380px] max-lg:hidden" />
      <Orb color="lavender" drift className="-bottom-40 -left-32 size-[440px]" />

      <Container className="grid items-center gap-14 pt-14 pb-20 sm:pt-20 lg:grid-cols-12 lg:gap-10 lg:pt-24 lg:pb-28">
        <div className="lg:col-span-7">
          <h1
            id="hero-title"
            className="max-w-[13ch] font-display text-[clamp(2.5rem,7vw,4rem)] leading-[1.05] font-light tracking-[-0.03em] text-ink"
          >
            AI agents that work for your business
          </h1>
          <p className="mt-6 max-w-[52ch] text-lg leading-[1.55] tracking-[0.01em] text-body">
            Automate conversations, follow-ups and repetitive workflows with AI agents connected to the systems and
            data your business already uses.
          </p>
          <p className="mt-5 font-display text-2xl leading-snug text-ink">
            Voice. Email. Messaging. One connected AI platform.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <CtaLink href={environments.demoUrl ?? Routes.auth.signup}>Book a demo</CtaLink>
            <CtaLink variant="outline" href={Routes.marketing.sections.solutions}>
              Explore AI solutions
            </CtaLink>
          </div>
        </div>
        <div className="lg:col-span-5">
          <RunLedger content={LandingLedger} />
        </div>
      </Container>
    </section>
  );
}
