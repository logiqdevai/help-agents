import { CheckIcon, MinusIcon } from "lucide-react";
import { Container } from "@/components/marketing/container";
import type { ProductContent } from "@/config/constants/products";

export function ProductDefinition({ product }: { product: ProductContent }) {
  const { definition } = product;
  return (
    <section aria-labelledby="definition-title" className="border-t border-hairline">
      <Container className="grid gap-12 py-20 lg:grid-cols-12 lg:gap-16 lg:py-28">
        <div className="lg:col-span-5">
          <h2
            id="definition-title"
            className="max-w-[14ch] font-display text-[clamp(2rem,4.4vw,3rem)] leading-[1.08] font-light tracking-[-0.02em] text-ink"
          >
            {definition.title}
          </h2>
          <p className="mt-6 max-w-[50ch] leading-[1.65] tracking-[0.01em] text-body">{definition.body}</p>
        </div>

        <div className="lg:col-span-7">
          <h3 className="font-display text-[1.75rem] leading-[1.15] font-light tracking-[-0.01em] text-ink">
            {definition.contrastTitle}
          </h3>
          <div className="mt-8 overflow-hidden rounded-xl border border-hairline bg-surface-card">
            <div className="grid grid-cols-2 border-b border-hairline-soft text-[15px] font-medium">
              <p className="px-5 py-4 text-muted-ink sm:px-6">{definition.beforeLabel}</p>
              <p className="border-l border-hairline-soft px-5 py-4 text-ink sm:px-6">{definition.afterLabel}</p>
            </div>
            <ul>
              {definition.rows.map((row) => (
                <li key={row.after} className="grid grid-cols-2 border-b border-hairline-soft last:border-b-0">
                  <p className="flex gap-3 px-5 py-5 text-[15px] leading-snug text-muted-ink sm:px-6">
                    <MinusIcon className="mt-0.5 size-4 shrink-0 text-muted-soft" aria-hidden />
                    {row.before}
                  </p>
                  <p className="flex gap-3 border-l border-hairline-soft px-5 py-5 text-[15px] leading-snug text-ink sm:px-6">
                    <CheckIcon className="mt-0.5 size-4 shrink-0 text-semantic-success" aria-hidden />
                    {row.after}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
