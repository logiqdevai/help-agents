import { CheckIcon } from "lucide-react";
import { Container } from "./container";
import { Orb } from "./orb";
import type { OrbColorName } from "@/interfaces/marketing.interfaces";

interface ControlPanelProps {
  title: string;
  intro: string;
  items: readonly string[];
  closing: string;
  orbs: readonly [OrbColorName, OrbColorName];
}

/** The dark "you stay in control" band. */
export function ControlPanel({ title, intro, items, closing, orbs }: ControlPanelProps) {
  return (
    <section aria-labelledby="control-title" className="px-3 pb-4 sm:px-5">
      <div className="relative isolate mx-auto max-w-[1360px] overflow-hidden rounded-2xl bg-surface-dark text-on-dark">
        <Orb color={orbs[0]} className="-top-40 -right-32 size-[520px] opacity-30" />
        <Orb color={orbs[1]} className="-bottom-48 -left-24 size-[480px] opacity-25" />
        <Container className="grid gap-12 py-20 lg:grid-cols-12 lg:gap-16 lg:py-28">
          <div className="lg:col-span-5">
            <h2
              id="control-title"
              className="max-w-[16ch] font-display text-[clamp(2rem,4.4vw,3rem)] leading-[1.08] font-light tracking-[-0.02em] text-on-dark"
            >
              {title}
            </h2>
            <p className="mt-5 max-w-[40ch] leading-[1.6] tracking-[0.01em] text-on-dark-soft">{intro}</p>
          </div>
          <div className="lg:col-span-7">
            <ul>
              {items.map((item) => (
                <li key={item} className="flex gap-4 border-t border-white/12 py-4 first:border-t-0 first:pt-0">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-white/10">
                    <CheckIcon className="size-3.5" aria-hidden />
                  </span>
                  <span className="text-[17px] leading-snug text-on-dark">{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 max-w-[52ch] border-t border-white/12 pt-6 leading-[1.6] tracking-[0.01em] text-on-dark-soft">
              {closing}
            </p>
          </div>
        </Container>
      </div>
    </section>
  );
}
