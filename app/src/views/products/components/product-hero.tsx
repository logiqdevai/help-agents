import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";
import { Container } from "@/components/marketing/container";
import { CtaLink } from "@/components/marketing/cta-link";
import { Orb } from "@/components/marketing/orb";
import { EmailSpecimen, MessagingSpecimen, VoiceSpecimen } from "@/components/marketing/solution-specimens";
import { ProductSlugs, type ProductContent, type ProductSlug } from "@/config/constants/products";
import { environments } from "@/config/environments";
import { Routes } from "@/routes/routes";

const Specimens: Record<ProductSlug, React.ComponentType<{ className?: string }>> = {
  [ProductSlugs.voice]: VoiceSpecimen,
  [ProductSlugs.email]: EmailSpecimen,
  [ProductSlugs.messaging]: MessagingSpecimen,
};

export function ProductHero({ product }: { product: ProductContent }) {
  const Specimen = Specimens[product.slug];
  return (
    <section aria-labelledby="product-title" className="relative isolate overflow-hidden">
      <Orb color={product.orbs[0]} drift className="-top-32 -right-24 size-[520px]" />
      <Orb color={product.orbs[1]} drift className="top-40 right-[22%] size-[380px] max-lg:hidden" />
      <Orb color={product.orbs[1]} drift className="-bottom-40 -left-32 size-[440px]" />

      <Container className="pt-8 pb-20 lg:pb-28">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-sm text-muted-ink">
            <li>
              <Link href={Routes.home} className="underline-offset-4 transition-colors hover:text-ink hover:underline">
                Home
              </Link>
            </li>
            <li aria-hidden>
              <ChevronRightIcon className="size-3.5" />
            </li>
            <li aria-current="page" className="text-ink">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="mt-10 grid items-center gap-14 lg:mt-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <h1
              id="product-title"
              className="max-w-[18ch] font-display text-[clamp(2.5rem,7vw,4rem)] leading-[1.05] font-light tracking-[-0.03em] text-ink"
            >
              {product.hero.title}
            </h1>
            <p className="mt-6 max-w-[52ch] text-lg leading-[1.55] tracking-[0.01em] text-body">{product.hero.lead}</p>
            <p className="mt-4 max-w-[52ch] leading-[1.6] tracking-[0.01em] text-body">{product.hero.support}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <CtaLink href={environments.demoUrl ?? Routes.auth.signup}>Book a demo</CtaLink>
              <CtaLink variant="outline" href="#how-it-works">
                See how it works
              </CtaLink>
            </div>
          </div>
          <div className="relative lg:col-span-5">
            <Specimen className="mx-auto w-full max-w-[520px]" />
          </div>
        </div>
      </Container>
    </section>
  );
}
