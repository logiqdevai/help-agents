import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { Container } from "@/components/marketing/container";
import { Industries, type IndustrySlug } from "@/config/constants/industries";
import { Routes } from "@/routes/routes";

export function OtherIndustries({ currentSlug }: { currentSlug: IndustrySlug }) {
  const others = Industries.filter((industry) => industry.slug !== currentSlug);
  return (
    <section aria-labelledby="other-industries-title" className="border-t border-hairline">
      <Container className="py-20 lg:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2
            id="other-industries-title"
            className="font-display text-[clamp(1.75rem,3.6vw,2.5rem)] leading-[1.1] font-light tracking-[-0.02em] text-ink"
          >
            AI automation for other industries
          </h2>
          <Link
            href={Routes.marketing.sections.useCases}
            className="inline-flex items-center gap-2 rounded-full text-[15px] font-medium text-ink underline decoration-hairline-strong underline-offset-[6px] transition-colors hover:decoration-ink"
          >
            See all use cases
            <ArrowRightIcon className="size-4" aria-hidden />
          </Link>
        </div>
        <ul className="mt-10 grid gap-px overflow-hidden rounded-xl border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
          {others.map((industry) => (
            <li key={industry.slug} className="bg-canvas">
              <Link
                href={industry.href}
                className="group flex h-full flex-col justify-between gap-8 p-7 transition-colors hover:bg-surface-card focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink"
              >
                <span className="font-display text-[1.6rem] leading-[1.15] font-light tracking-[-0.01em] text-ink">
                  {industry.name}
                </span>
                <span className="flex items-end gap-2 text-[15px] text-body">
                  {industry.hero.stack.join(", ")}
                  <ArrowRightIcon
                    className="ml-auto size-4 shrink-0 text-ink transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                    aria-hidden
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
