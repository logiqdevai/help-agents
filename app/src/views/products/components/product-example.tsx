import { Container } from "@/components/marketing/container";
import { Orb } from "@/components/marketing/orb";
import { RunLedger } from "@/components/marketing/run-ledger";
import type { ProductContent } from "@/config/constants/products";

export function ProductExample({ product }: { product: ProductContent }) {
  const { example } = product;
  return (
    <section aria-labelledby="example-title" className="border-t border-hairline">
      <Container className="grid items-center gap-12 py-20 lg:grid-cols-12 lg:gap-16 lg:py-28">
        <div className="lg:col-span-5">
          <h2
            id="example-title"
            className="max-w-[14ch] font-display text-[clamp(2rem,4.4vw,3rem)] leading-[1.08] font-light tracking-[-0.02em] text-ink"
          >
            {example.title}
          </h2>
          <p className="mt-5 max-w-[44ch] leading-[1.6] tracking-[0.01em] text-body">{example.intro}</p>
        </div>
        <div className="relative isolate lg:col-span-7">
          <Orb color={product.orbs[1]} className="top-[55%] left-[62%] size-[460px] -translate-x-1/2 -translate-y-1/2" />
          <RunLedger content={example.ledger} className="mx-auto w-full max-w-[560px]" />
        </div>
      </Container>
    </section>
  );
}
