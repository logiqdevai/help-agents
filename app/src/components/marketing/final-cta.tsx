import { Container } from "./container";
import { CtaLink } from "./cta-link";
import { Orb } from "./orb";
import { environments } from "@/config/environments";
import { Routes } from "@/routes/routes";

interface FinalCtaProps {
  title?: string;
  body?: string;
  /** Target of the secondary button. */
  secondaryHref?: string;
  secondaryLabel?: string;
}

export function FinalCta({
  title = "What could your business automate?",
  body = "Tell us how your business works and we’ll show you where AI agents can take over repetitive tasks and workflows.",
  secondaryHref = Routes.marketing.sections.howItWorks,
  secondaryLabel = "See how it works",
}: FinalCtaProps) {
  return (
    <section aria-labelledby="final-cta-title" className="pb-20 lg:pb-28">
      <Container>
        <div className="relative isolate overflow-hidden rounded-2xl border border-hairline bg-canvas-soft px-6 py-20 text-center sm:px-12 lg:py-28">
          <Orb color="mint" drift className="-top-24 -left-20 size-[420px]" />
          <Orb color="peach" className="-right-16 -bottom-32 size-[440px]" />
          <Orb color="lavender" drift className="top-1/2 left-1/2 size-[380px] -translate-x-1/2 -translate-y-1/2" />
          <h2
            id="final-cta-title"
            className="mx-auto max-w-[16ch] font-display text-[clamp(2.25rem,5.2vw,3.5rem)] leading-[1.08] font-light tracking-[-0.025em] text-ink"
          >
            {title}
          </h2>
          <p className="mx-auto mt-6 max-w-[48ch] text-lg leading-[1.55] tracking-[0.01em] text-body">{body}</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            {environments.demoUrl && <CtaLink href={environments.demoUrl}>Book a demo</CtaLink>}
            <CtaLink variant="outline" href={secondaryHref}>
              {secondaryLabel}
            </CtaLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
