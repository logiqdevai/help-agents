import { ArrowRightIcon } from "lucide-react";
import { Container } from "./container";
import { Orb } from "./orb";
import { LandingExampleFlow, LandingLoopVerbs } from "@/config/constants/landing";

export function ConnectedAi() {
  return (
    <section aria-labelledby="connected-title" className="px-3 pb-4 sm:px-5">
      <div className="relative isolate mx-auto max-w-[1360px] overflow-hidden rounded-2xl bg-surface-dark text-on-dark">
        <Orb color="lavender" className="-top-40 -right-32 size-[520px] opacity-30" />
        <Orb color="sky" className="-bottom-48 -left-24 size-[480px] opacity-25" />
        <Container className="py-20 lg:py-28">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
            <h2
              id="connected-title"
              className="font-display text-[clamp(2rem,4.4vw,3rem)] leading-[1.08] font-light tracking-[-0.02em] text-on-dark lg:col-span-6"
            >
              AI that can read, understand and act
            </h2>
            <div className="flex max-w-[52ch] flex-col gap-4 leading-[1.6] tracking-[0.01em] text-on-dark-soft lg:col-span-5 lg:col-start-8">
              <p>Most AI tools simply generate text.</p>
              <p className="text-on-dark">Our agents can go further.</p>
              <p>
                They can understand information from your business systems and use that information to perform real
                actions.
              </p>
            </div>
          </div>

          <ol
            aria-label="How an agent works"
            className="mt-16 flex flex-wrap items-center gap-x-4 gap-y-3 font-display text-[clamp(1.75rem,4.2vw,3.5rem)] leading-none font-light tracking-[-0.02em] lg:mt-24"
          >
            {LandingLoopVerbs.map((verb, index) => (
              <li key={verb} className="flex items-center gap-4">
                {verb}
                {index < LandingLoopVerbs.length - 1 ? (
                  <ArrowRightIcon className="size-[0.6em] text-on-dark-soft" aria-hidden />
                ) : null}
              </li>
            ))}
          </ol>

          <div className="mt-14 border-t border-white/12 pt-8 lg:mt-20">
            <p className="text-[15px] text-on-dark-soft">For example</p>
            <ol className="mt-5 flex max-w-5xl flex-wrap items-center gap-x-3 gap-y-2 font-display text-[clamp(1.25rem,2.3vw,1.75rem)] leading-snug font-light text-on-dark">
              {LandingExampleFlow.map((step, index) => (
                <li key={step} className="flex items-center gap-3">
                  {step}
                  {index < LandingExampleFlow.length - 1 ? (
                    <ArrowRightIcon className="size-[0.7em] text-on-dark-soft" aria-hidden />
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </div>
    </section>
  );
}
