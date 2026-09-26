import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";
import { Container } from "@/components/marketing/container";
import { CtaLink } from "@/components/marketing/cta-link";
import { Orb } from "@/components/marketing/orb";
import { RunLedger } from "@/components/marketing/run-ledger";
import type { IndustryContent } from "@/config/constants/industries";
import { environments } from "@/config/environments";
import { Routes } from "@/routes/routes";

export function IndustryHero({ industry }: { industry: IndustryContent }) {
  const { hero, orbs } = industry;
  return (
    <section aria-labelledby="industry-title" className="relative isolate overflow-hidden">
      <Orb color={orbs[0]} drift className="-top-32 -right-24 size-[520px]" />
      <Orb color={orbs[1]} drift className="top-40 right-[22%] size-[380px] max-lg:hidden" />
      <Orb color={orbs[1]} drift className="-bottom-40 -left-32 size-[440px]" />

      <Container className="pt-8 pb-20 lg:pb-28">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-sm text-muted-ink">
            <li>
              <Link href={Routes.home} className="transition-colors hover:text-ink hover:underline underline-offset-4">
                Home
              </Link>
            </li>
            <li aria-hidden>
              <ChevronRightIcon className="size-3.5" />
            </li>
            <li aria-current="page" className="text-ink">
              {industry.name}
            </li>
          </ol>
        </nav>

        <div className="mt-10 grid items-center gap-14 lg:mt-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <h1
              id="industry-title"
              className="max-w-[15ch] font-display text-[clamp(2.5rem,7vw,4rem)] leading-[1.05] font-light tracking-[-0.03em] text-ink"
            >
              {hero.title}
            </h1>
            <p className="mt-6 max-w-[52ch] text-lg leading-[1.55] tracking-[0.01em] text-body">{hero.lead}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              {environments.demoUrl && <CtaLink href={environments.demoUrl}>Book a demo</CtaLink>}
              <CtaLink variant="outline" href="#how-it-works">
                See how it works
              </CtaLink>
            </div>
          </div>
          <div className="lg:col-span-5">
            <RunLedger content={industry.ledger} />
          </div>
        </div>
      </Container>
    </section>
  );
}
