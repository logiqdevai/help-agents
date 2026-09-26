import { Container } from "./container";
import { LandingExpansionStages } from "@/config/constants/landing";
import { cn } from "@/lib/utils";

// Each stage sits a step higher than the last: the workforce grows one workflow at a time.
// Classes are spelled out in full so Tailwind can see them.
const StageStyles = [
  {
    height: "lg:min-h-[132px]",
    indent: "ml-0",
    tint: "bg-[radial-gradient(circle_at_85%_110%,var(--color-gradient-mint),transparent_65%)]",
  },
  {
    height: "lg:min-h-[192px]",
    indent: "ml-4",
    tint: "bg-[radial-gradient(circle_at_85%_110%,var(--color-gradient-sky),transparent_65%)]",
  },
  {
    height: "lg:min-h-[252px]",
    indent: "ml-8",
    tint: "bg-[radial-gradient(circle_at_85%_110%,var(--color-gradient-lavender),transparent_65%)]",
  },
  {
    height: "lg:min-h-[312px]",
    indent: "ml-12",
    tint: "bg-[radial-gradient(circle_at_85%_110%,var(--color-gradient-peach),transparent_65%)]",
  },
  {
    height: "lg:min-h-[372px]",
    indent: "ml-16",
    tint: "bg-[radial-gradient(circle_at_85%_110%,var(--color-gradient-rose),transparent_65%)]",
  },
] as const;

export function Expansion() {
  return (
    <section aria-labelledby="expansion-title" className="border-t border-hairline">
      <Container className="py-20 lg:py-28">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
          <h2
            id="expansion-title"
            className="font-display text-[clamp(2rem,4.4vw,3rem)] leading-[1.08] font-light tracking-[-0.02em] text-ink lg:col-span-6"
          >
            Start with one agent. Expand as you need.
          </h2>
          <div className="flex max-w-[50ch] flex-col gap-4 leading-[1.6] tracking-[0.01em] text-body lg:col-span-5 lg:col-start-8">
            <p>You don&rsquo;t need to automate everything at once.</p>
            <p>Start with a single workflow and expand over time.</p>
          </div>
        </div>

        <ol className="mt-14 flex flex-col gap-3 lg:mt-20 lg:flex-row lg:items-end lg:gap-4">
          {LandingExpansionStages.map((stage, index) => (
            <li
              key={stage}
              className={cn(
                "flex items-start rounded-xl border border-hairline bg-surface-card px-5 py-5 lg:flex-1",
                StageStyles[index].indent,
                "lg:ml-0",
                StageStyles[index].height,
                StageStyles[index].tint,
              )}
            >
              <span className="text-[17px] leading-tight font-medium text-ink">{stage}</span>
            </li>
          ))}
        </ol>

        <p className="mt-10 max-w-[52ch] font-display text-[1.75rem] leading-[1.2] font-light text-ink">
          Build an AI-powered operation around your business, one workflow at a time.
        </p>
      </Container>
    </section>
  );
}
