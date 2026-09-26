import { Container } from "@/components/marketing/container";
import type { IndustryContent } from "@/config/constants/industries";

export function IndustryPains({ industry }: { industry: IndustryContent }) {
  const { pains } = industry;
  return (
    <section aria-labelledby="pains-title" className="border-t border-hairline">
      <Container className="py-20 lg:py-28">
        <div className="max-w-3xl">
          <h2
            id="pains-title"
            className="font-display text-[clamp(2rem,4.4vw,3rem)] leading-[1.08] font-light tracking-[-0.02em] text-ink"
          >
            {pains.title}
          </h2>
          <p className="mt-5 max-w-[56ch] text-lg leading-[1.55] tracking-[0.01em] text-body">{pains.intro}</p>
        </div>

        <ul className="mt-14 border-b border-hairline lg:mt-16">
          {pains.items.map((item) => (
            <li key={item.title} className="grid gap-x-8 gap-y-3 border-t border-hairline py-8 lg:grid-cols-12 lg:py-9">
              <h3 className="font-display text-[1.6rem] leading-[1.18] font-light tracking-[-0.01em] text-ink lg:col-span-5">
                {item.title}
              </h3>
              <p className="max-w-[56ch] leading-[1.6] tracking-[0.01em] text-body lg:col-span-6 lg:col-start-7">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
