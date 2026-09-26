import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { Container } from "./container";
import { Orb } from "./orb";
import { LandingAnyWorkflow, LandingUseCases } from "@/config/constants/landing";

const rowClass =
  "group relative grid gap-x-8 gap-y-4 border-t border-hairline px-4 py-9 transition-colors hover:bg-surface-card/70 sm:px-6 lg:grid-cols-12 lg:py-10";
const linkClass =
  "inline-flex items-center gap-2 rounded-full text-[15px] font-medium text-ink underline decoration-hairline-strong underline-offset-[6px] transition-colors group-hover:decoration-ink after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink";

function StackPills({ stack }: { stack: readonly string[] }) {
  return (
    <ul aria-label="Built with" className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
      {stack.map((item, index) => (
        <li key={item} className="flex items-center gap-1.5">
          {index > 0 ? (
            <span aria-hidden className="text-muted-soft">
              +
            </span>
          ) : null}
          <span className="rounded-full border border-hairline-strong bg-surface-card px-3 py-1 text-[13px] font-medium text-ink">
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function UseCases() {
  return (
    <section id="use-cases" aria-labelledby="use-cases-title" className="scroll-mt-16 border-t border-hairline">
      <Container className="py-20 lg:py-28">
        <div className="max-w-2xl">
          <h2
            id="use-cases-title"
            className="font-display text-[clamp(2rem,4.4vw,3rem)] leading-[1.08] font-light tracking-[-0.02em] text-ink"
          >
            What can you automate?
          </h2>
          <p className="mt-5 max-w-[52ch] text-lg leading-[1.55] tracking-[0.01em] text-body">
            AI automation can be adapted to different industries, teams and business processes.
          </p>
        </div>

        <ul className="-mx-4 mt-14 border-b border-hairline sm:-mx-6 lg:mt-16">
          {LandingUseCases.map((useCase) => (
            <li key={useCase.title} className={rowClass}>
              <h3 className="font-display text-[1.75rem] leading-[1.15] font-light tracking-[-0.01em] text-ink lg:col-span-3">
                {useCase.title}
              </h3>
              <p className="max-w-[46ch] leading-[1.6] tracking-[0.01em] text-body lg:col-span-5">{useCase.body}</p>
              <div className="flex flex-col items-start gap-5 lg:col-span-4">
                <StackPills stack={useCase.stack} />
                <Link href={useCase.href} className={linkClass}>
                  {useCase.cta}
                  <ArrowRightIcon
                    className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                    aria-hidden
                  />
                </Link>
              </div>
            </li>
          ))}
          <li className={`${rowClass} isolate overflow-hidden`}>
            <Orb color="peach" className="top-1/2 -right-16 size-[320px] -translate-y-1/2" />
            <Orb color="mint" className="top-1/2 right-48 size-[260px] -translate-y-1/2 max-lg:hidden" />
            <h3 className="font-display text-[1.75rem] leading-[1.15] font-light tracking-[-0.01em] text-ink lg:col-span-3">
              {LandingAnyWorkflow.title}
            </h3>
            <p className="max-w-[46ch] leading-[1.6] tracking-[0.01em] text-body lg:col-span-5">
              {LandingAnyWorkflow.body}
            </p>
            <div className="lg:col-span-4">
              <Link href={LandingAnyWorkflow.href} className={linkClass}>
                {LandingAnyWorkflow.cta}
                <ArrowRightIcon
                  className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                  aria-hidden
                />
              </Link>
            </div>
          </li>
        </ul>
      </Container>
    </section>
  );
}
