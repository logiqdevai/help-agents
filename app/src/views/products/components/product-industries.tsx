import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { Container } from "@/components/marketing/container";
import { getIndustry } from "@/config/constants/industries";
import type { ProductContent } from "@/config/constants/products";

export function ProductIndustries({ product }: { product: ProductContent }) {
  const { industries } = product;
  return (
    <section aria-labelledby="product-industries-title" className="border-t border-hairline">
      <Container className="py-20 lg:py-28">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
          <h2
            id="product-industries-title"
            className="max-w-[18ch] font-display text-[clamp(2rem,4.4vw,3rem)] leading-[1.08] font-light tracking-[-0.02em] text-ink lg:col-span-6"
          >
            {industries.title}
          </h2>
          <p className="max-w-[50ch] leading-[1.6] tracking-[0.01em] text-body lg:col-span-5 lg:col-start-8">
            {industries.intro}
          </p>
        </div>

        <ul className="mt-14 border-b border-hairline lg:mt-16">
          {industries.items.map((item) => {
            const industry = getIndustry(item.slug);
            if (!industry) return null;
            return (
              <li
                key={item.slug}
                className="group relative grid gap-x-8 gap-y-3 border-t border-hairline px-4 py-8 transition-colors hover:bg-surface-card/70 sm:px-6 lg:grid-cols-12 lg:py-9"
              >
                <h3 className="font-display text-[1.6rem] leading-[1.18] font-light tracking-[-0.01em] text-ink lg:col-span-3">
                  {industry.name}
                </h3>
                <p className="max-w-[52ch] leading-[1.6] tracking-[0.01em] text-body lg:col-span-5">{item.body}</p>
                <div className="lg:col-span-4">
                  <Link
                    href={industry.href}
                    className="inline-flex items-center gap-2 rounded-full text-[15px] font-medium text-ink underline decoration-hairline-strong underline-offset-[6px] transition-colors after:absolute after:inset-0 group-hover:decoration-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                  >
                    {product.name} for {industry.name.toLowerCase()}
                    <ArrowRightIcon
                      className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                      aria-hidden
                    />
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
