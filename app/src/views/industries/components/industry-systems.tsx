import { Container } from "@/components/marketing/container";
import type { IndustryContent } from "@/config/constants/industries";

export function IndustrySystems({ industry }: { industry: IndustryContent }) {
  const { systems } = industry;
  return (
    <section aria-labelledby="systems-title" className="border-t border-hairline">
      <Container className="grid gap-12 py-20 lg:grid-cols-12 lg:gap-16 lg:py-28">
        <div className="lg:col-span-5">
          <h2
            id="systems-title"
            className="max-w-[16ch] font-display text-[clamp(2rem,4.4vw,3rem)] leading-[1.08] font-light tracking-[-0.02em] text-ink"
          >
            {systems.title}
          </h2>
          <p className="mt-5 max-w-[44ch] leading-[1.6] tracking-[0.01em] text-body">{systems.intro}</p>
        </div>
        <ul className="grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:col-span-7">
          {systems.items.map((item) => (
            <li key={item.title} className="flex gap-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-strong">
                <item.icon className="size-4 text-ink" aria-hidden />
              </span>
              <div>
                <h3 className="text-lg leading-[1.35] font-medium text-ink">{item.title}</h3>
                <p className="mt-1.5 text-[15px] leading-[1.55] tracking-[0.01em] text-body">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
