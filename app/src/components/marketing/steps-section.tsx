import { Container } from "./container";
import type { MarketingTextItem } from "@/interfaces/marketing.interfaces";

interface StepsSectionProps {
  title: string;
  intro: string;
  steps: readonly MarketingTextItem[];
  /** Anchor id for in-page links such as "See how it works". */
  id?: string;
}

/** A real sequence, so the numerals earn their place. */
export function StepsSection({ title, intro, steps, id = "how-it-works" }: StepsSectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-16 border-t border-hairline">
      <Container className="grid gap-12 py-20 lg:grid-cols-12 lg:gap-16 lg:py-28">
        <div className="lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
          <h2
            id={`${id}-title`}
            className="max-w-[14ch] font-display text-[clamp(2rem,4.4vw,3rem)] leading-[1.08] font-light tracking-[-0.02em] text-ink"
          >
            {title}
          </h2>
          <p className="mt-5 max-w-[44ch] leading-[1.6] tracking-[0.01em] text-body">{intro}</p>
        </div>
        <ol className="lg:col-span-7">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="grid grid-cols-[3.5rem_1fr] gap-x-4 border-t border-hairline py-8 first:border-t-0 first:pt-0"
            >
              <span aria-hidden className="font-display text-[2.5rem] leading-none font-light text-muted-soft">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-xl leading-[1.35] font-medium text-ink">{step.title}</h3>
                <p className="mt-2 max-w-[54ch] leading-[1.6] tracking-[0.01em] text-body">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
