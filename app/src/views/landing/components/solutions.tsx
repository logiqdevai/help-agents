import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { Container } from "@/components/marketing/container";
import { Orb, type OrbColor } from "@/components/marketing/orb";
import { EmailSpecimen, MessagingSpecimen, VoiceSpecimen } from "@/components/marketing/solution-specimens";
import {
  LandingSolutionIds,
  LandingSolutions,
  type LandingSolutionId,
} from "@/config/constants/landing";

const Specimens: Record<LandingSolutionId, React.ComponentType<{ className?: string }>> = {
  [LandingSolutionIds.voice]: VoiceSpecimen,
  [LandingSolutionIds.email]: EmailSpecimen,
  [LandingSolutionIds.messaging]: MessagingSpecimen,
};

const SpecimenOrbs: Record<LandingSolutionId, OrbColor> = {
  [LandingSolutionIds.voice]: "mint",
  [LandingSolutionIds.email]: "peach",
  [LandingSolutionIds.messaging]: "lavender",
};

export function Solutions() {
  return (
    <section id="solutions" aria-labelledby="solutions-title" className="scroll-mt-16 border-t border-hairline">
      <Container className="py-20 lg:py-28">
        <div className="max-w-2xl">
          <h2
            id="solutions-title"
            className="font-display text-[clamp(2rem,4.4vw,3rem)] leading-[1.08] font-light tracking-[-0.02em] text-ink"
          >
            One agent for each channel
          </h2>
        </div>

        <div className="mt-16 lg:mt-20">
          {LandingSolutions.map((solution) => {
            const Specimen = Specimens[solution.id];
            return (
              <article
                key={solution.id}
                className="grid items-center gap-10 border-t border-hairline py-14 first:border-t-0 first:pt-0 lg:grid-cols-12 lg:gap-16 lg:py-20"
              >
                <div className="lg:col-span-5">
                  <div className="flex items-center gap-2.5 text-[15px] font-medium text-ink">
                    <span className="flex size-8 items-center justify-center rounded-full bg-surface-strong">
                      <solution.icon className="size-4" aria-hidden />
                    </span>
                    {solution.name}
                  </div>
                  <h3 className="mt-5 font-display text-[clamp(1.75rem,3.2vw,2.25rem)] leading-[1.13] font-light tracking-[-0.01em] text-ink">
                    {solution.title}
                  </h3>
                  <p className="mt-5 max-w-[50ch] leading-[1.6] tracking-[0.01em] text-body">{solution.body}</p>
                  <Link
                    href={solution.href}
                    className="group mt-6 inline-flex items-center gap-2 rounded-full text-[15px] font-medium text-ink underline decoration-hairline-strong underline-offset-[6px] transition-colors hover:decoration-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                  >
                    {solution.cta}
                    <ArrowRightIcon
                      className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                      aria-hidden
                    />
                  </Link>
                </div>
                <div className="relative isolate lg:col-span-7">
                  <Orb
                    color={SpecimenOrbs[solution.id]}
                    className="top-[58%] left-[64%] size-[440px] -translate-x-1/2 -translate-y-1/2"
                  />
                  <Specimen className="mx-auto w-full max-w-[520px]" />
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
