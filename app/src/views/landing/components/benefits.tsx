import { Container } from "./container";
import { LandingBenefits } from "@/config/constants/landing";

export function Benefits() {
  return (
    <section aria-labelledby="benefits-title" className="border-t border-hairline">
      <Container className="grid gap-12 py-20 lg:grid-cols-12 lg:gap-16 lg:py-28">
        <h2
          id="benefits-title"
          className="max-w-[14ch] font-display text-[clamp(2rem,4.4vw,3rem)] leading-[1.08] font-light tracking-[-0.02em] text-ink lg:sticky lg:top-28 lg:col-span-5 lg:self-start"
        >
          Spend less time on repetitive work
        </h2>
        <ul className="lg:col-span-7">
          {LandingBenefits.map((benefit) => (
            <li key={benefit.title} className="border-t border-hairline py-7 first:border-t-0 first:pt-0">
              <h3 className="text-xl leading-[1.35] font-medium text-ink">{benefit.title}</h3>
              <p className="mt-2 max-w-[52ch] leading-[1.6] tracking-[0.01em] text-body">{benefit.body}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
