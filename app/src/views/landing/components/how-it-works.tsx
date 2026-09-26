import { Container } from "./container";
import { LandingSteps } from "@/config/constants/landing";

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="scroll-mt-16 border-t border-hairline">
      <Container className="py-20 lg:py-28">
        <div className="max-w-3xl">
          <h2
            id="how-title"
            className="font-display text-[clamp(2rem,4.4vw,3rem)] leading-[1.08] font-light tracking-[-0.02em] text-ink"
          >
            Connect your systems. Give AI the context. Let it act.
          </h2>
          <p className="mt-5 max-w-[56ch] text-lg leading-[1.55] tracking-[0.01em] text-body">
            AI becomes significantly more useful when it can access the information and tools your business already
            relies on.
          </p>
        </div>

        <ol className="mt-16 grid gap-y-12 lg:mt-20 lg:grid-cols-5 lg:gap-x-8">
          {LandingSteps.map((step, index) => (
            <li
              key={step.title}
              className="relative border-l border-hairline-strong pl-7 before:absolute before:top-2 before:-left-[5px] before:size-2.5 before:rounded-full before:bg-ink lg:border-t lg:border-l-0 lg:pt-8 lg:pl-0 lg:before:-top-[5px] lg:before:left-0"
            >
              <span aria-hidden className="font-display text-[2.5rem] leading-none font-light text-muted-soft">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-xl leading-[1.35] font-medium text-ink">{step.title}</h3>
              <p className="mt-2 max-w-[34ch] text-[15px] leading-[1.55] tracking-[0.01em] text-body">{step.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
