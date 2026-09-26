import { Container } from "@/components/marketing/container";
import type { ProductContent } from "@/config/constants/products";

export function ProductCapabilities({ product }: { product: ProductContent }) {
  const { capabilities } = product;
  return (
    <section aria-labelledby="capabilities-title" className="border-t border-hairline">
      <Container className="py-20 lg:py-28">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
          <h2
            id="capabilities-title"
            className="font-display text-[clamp(2rem,4.4vw,3rem)] leading-[1.08] font-light tracking-[-0.02em] text-ink lg:col-span-6"
          >
            {capabilities.title}
          </h2>
          <p className="max-w-[50ch] leading-[1.6] tracking-[0.01em] text-body lg:col-span-5 lg:col-start-8">
            {capabilities.intro}
          </p>
        </div>

        <ul className="mt-14 grid gap-px overflow-hidden rounded-xl border border-hairline bg-hairline sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {capabilities.items.map((item) => (
            <li key={item.title} className="bg-canvas p-7 lg:p-8">
              <span className="flex size-8 items-center justify-center rounded-full bg-surface-strong">
                <item.icon className="size-4 text-ink" aria-hidden />
              </span>
              <h3 className="mt-5 text-xl leading-[1.35] font-medium text-ink">{item.title}</h3>
              <p className="mt-2 text-[15px] leading-[1.55] tracking-[0.01em] text-body">{item.body}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
