import Link from "next/link";
import { APP_NAME } from "@/config/constants/app";
import { Routes } from "@/routes/routes";

interface AuthShellProps {
  children: React.ReactNode;
  artTitle: string;
  artText: string;
  /** Orb colors for the right-hand art panel — purely decorative. */
  orbs?: ("mint" | "peach" | "lavender" | "sky" | "rose")[];
}

const orbClass: Record<string, string> = {
  mint: "bg-[radial-gradient(circle,var(--color-gradient-mint),transparent_68%)]",
  peach: "bg-[radial-gradient(circle,var(--color-gradient-peach),transparent_68%)]",
  lavender: "bg-[radial-gradient(circle,var(--color-gradient-lavender),transparent_68%)]",
  sky: "bg-[radial-gradient(circle,var(--color-gradient-sky),transparent_68%)]",
  rose: "bg-[radial-gradient(circle,var(--color-gradient-rose),transparent_68%)]",
};

const orbPositions = [
  "-left-24 -top-20 size-[420px]",
  "-right-28 top-1/4 size-[460px]",
  "left-[10%] -bottom-36 size-[380px]",
  "right-[8%] -top-14 size-[260px]",
];

/** Two-column auth layout: form on the left, atmospheric gradient panel on the right (hidden on mobile). */
export function AuthShell({ children, artTitle, artText, orbs = ["mint", "lavender", "peach", "sky"] }: AuthShellProps) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <div className="flex flex-col px-5 py-6 md:px-12 md:py-7">
        <Link href={Routes.auth.login} className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="size-7 rounded-full bg-[radial-gradient(circle_at_30%_30%,var(--color-gradient-mint),var(--color-gradient-lavender)_60%,var(--color-gradient-peach))]"
          />
          <span className="font-display text-[22px] font-light tracking-tight">{APP_NAME}</span>
        </Link>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="flex w-full max-w-[400px] flex-col gap-6">{children}</div>
        </div>
        <p className="text-[13px] text-muted-foreground">© 2026 {APP_NAME}</p>
      </div>
      <aside
        aria-hidden="true"
        className="relative m-4 ml-0 hidden overflow-hidden rounded-3xl border border-border bg-muted p-14 lg:flex lg:flex-col lg:justify-end"
      >
        {orbs.slice(0, orbPositions.length).map((orb, i) => (
          <span
            key={`${orb}-${i}`}
            className={`absolute -z-0 rounded-full blur-[60px] ${orbClass[orb]} ${orbPositions[i]}`}
          />
        ))}
        <h2 className="relative max-w-[460px] font-display text-[44px] leading-[1.08] font-light tracking-tight">
          {artTitle}
        </h2>
        <p className="relative mt-3.5 max-w-[420px] text-body">{artText}</p>
      </aside>
    </div>
  );
}

export function AuthHeading({ title, lede }: { title: string; lede?: React.ReactNode }) {
  return (
    <div>
      <h1 className="font-display text-[40px] leading-[1.1] font-light tracking-tight">{title}</h1>
      {lede ? <p className="mt-2 text-muted-foreground">{lede}</p> : null}
    </div>
  );
}
