import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { Container } from "./container";
import { Products, type ProductSlug } from "@/config/constants/products";
import { cn } from "@/lib/utils";

interface ProductLinksProps {
  title: string;
  intro: string;
  /** Leave out the product whose page this is shown on. */
  exclude?: ProductSlug;
}

/** Links to the product pages: the "spokes" of the hub-and-spoke structure. */
export function ProductLinks({ title, intro, exclude }: ProductLinksProps) {
  const products = Products.filter((product) => product.slug !== exclude);
  return (
    <section aria-labelledby="product-links-title" className="border-t border-hairline">
      <Container className="py-20 lg:py-28">
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-16">
          <h2
            id="product-links-title"
            className="max-w-[20ch] font-display text-[clamp(1.75rem,3.6vw,2.5rem)] leading-[1.1] font-light tracking-[-0.02em] text-ink lg:col-span-6"
          >
            {title}
          </h2>
          <p className="max-w-[46ch] leading-[1.6] tracking-[0.01em] text-body lg:col-span-5 lg:col-start-8">{intro}</p>
        </div>
        <ul
          className={cn(
            "mt-12 grid gap-px overflow-hidden rounded-xl border border-hairline bg-hairline",
            products.length === 3 ? "lg:grid-cols-3" : "sm:grid-cols-2",
          )}
        >
          {products.map((product) => (
            <li key={product.slug} className="bg-canvas">
              <Link
                href={product.href}
                className="group flex h-full flex-col gap-5 p-7 transition-colors hover:bg-surface-card focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink lg:p-8"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-surface-strong">
                  <product.icon className="size-4 text-ink" aria-hidden />
                </span>
                <span className="font-display text-[1.6rem] leading-[1.15] font-light tracking-[-0.01em] text-ink">
                  {product.name}
                </span>
                <span className="text-[15px] leading-[1.55] tracking-[0.01em] text-body">{product.tagline}</span>
                <span className="mt-auto inline-flex items-center gap-2 pt-2 text-[15px] font-medium text-ink">
                  Explore {product.name}
                  <ArrowRightIcon
                    className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                    aria-hidden
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
