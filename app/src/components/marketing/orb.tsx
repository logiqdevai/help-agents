import { cn } from "@/lib/utils";

const OrbColors = {
  mint: "bg-[radial-gradient(circle,var(--color-gradient-mint),color-mix(in_srgb,var(--color-gradient-mint)_45%,transparent)_35%,color-mix(in_srgb,var(--color-gradient-mint)_12%,transparent)_58%,transparent_75%)]",
  peach: "bg-[radial-gradient(circle,var(--color-gradient-peach),color-mix(in_srgb,var(--color-gradient-peach)_45%,transparent)_35%,color-mix(in_srgb,var(--color-gradient-peach)_12%,transparent)_58%,transparent_75%)]",
  lavender: "bg-[radial-gradient(circle,var(--color-gradient-lavender),color-mix(in_srgb,var(--color-gradient-lavender)_45%,transparent)_35%,color-mix(in_srgb,var(--color-gradient-lavender)_12%,transparent)_58%,transparent_75%)]",
  sky: "bg-[radial-gradient(circle,var(--color-gradient-sky),color-mix(in_srgb,var(--color-gradient-sky)_45%,transparent)_35%,color-mix(in_srgb,var(--color-gradient-sky)_12%,transparent)_58%,transparent_75%)]",
  rose: "bg-[radial-gradient(circle,var(--color-gradient-rose),color-mix(in_srgb,var(--color-gradient-rose)_45%,transparent)_35%,color-mix(in_srgb,var(--color-gradient-rose)_12%,transparent)_58%,transparent_75%)]",
} as const;

export type OrbColor = keyof typeof OrbColors;

interface OrbProps {
  color: OrbColor;
  /** Position and size, e.g. "-right-24 top-0 size-[420px]". */
  className?: string;
  drift?: boolean;
}

/** DESIGN.MD atmospheric orb: pure decoration, never a surface, button fill or text colour. */
export function Orb({ color, className, drift = false }: OrbProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute -z-10 rounded-full opacity-85 blur-3xl",
        OrbColors[color],
        drift && "animate-orb-drift motion-reduce:animate-none",
        className,
      )}
    />
  );
}
