import { CheckIcon } from "lucide-react";
import type { RunLedgerContent } from "@/interfaces/marketing.interfaces";
import { cn } from "@/lib/utils";

// Static heights (in a 48-unit box) for the mini call waveform.
const WaveformHeights = [8, 16, 26, 14, 34, 22, 40, 18, 28, 12, 36, 24, 16, 30, 10, 20];

// Tailwind needs full class names, so the reveal delays are spelled out (one per row, 8 max).
const RowDelays = [
  "[animation-delay:600ms]",
  "[animation-delay:1150ms]",
  "[animation-delay:1700ms]",
  "[animation-delay:2250ms]",
  "[animation-delay:2800ms]",
  "[animation-delay:3350ms]",
  "[animation-delay:3900ms]",
  "[animation-delay:4450ms]",
] as const;
// Indexed by row count: appears 250ms after the last row lands.
const DoneDelays = [
  "[animation-delay:600ms]",
  "[animation-delay:850ms]",
  "[animation-delay:1400ms]",
  "[animation-delay:1950ms]",
  "[animation-delay:2500ms]",
  "[animation-delay:3050ms]",
  "[animation-delay:3600ms]",
  "[animation-delay:4150ms]",
  "[animation-delay:4700ms]",
] as const;

function MiniWaveform() {
  return (
    <svg aria-hidden viewBox="0 0 128 48" preserveAspectRatio="xMinYMid meet" className="mt-2 h-6 w-32 text-ink/70">
      {WaveformHeights.map((height, i) => (
        <rect
          key={i}
          x={i * 8 + 1}
          y={(48 - height) / 2}
          width={4}
          height={height}
          rx={2}
          fill="currentColor"
          opacity={i > 11 ? 0.28 : 1}
        />
      ))}
    </svg>
  );
}

interface RunLedgerProps {
  content: RunLedgerContent;
  className?: string;
}

/** One example lead or request handled across channels, written line by line on load. */
export function RunLedger({ content, className }: RunLedgerProps) {
  const { rows } = content;
  return (
    <figure
      aria-label={content.description}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-hairline bg-surface-card shadow-[0_4px_16px_rgba(0,0,0,0.04)]",
        className,
      )}
    >
      <figcaption className="flex items-center justify-between gap-4 border-b border-hairline-soft px-5 py-4">
        <span className="text-[15px] font-medium text-ink">{content.title}</span>
        <span
          className={cn(
            "inline-flex shrink-0 animate-ledger-in items-center gap-1.5 whitespace-nowrap rounded-full bg-surface-strong px-2.5 py-1 text-[13px] font-medium text-ink motion-reduce:animate-none",
            DoneDelays[Math.min(rows.length, DoneDelays.length - 1)],
          )}
        >
          <CheckIcon className="size-3.5 text-semantic-success" aria-hidden />
          {content.doneLabel}
        </span>
      </figcaption>
      <ol className="relative px-5 py-2">
        <span aria-hidden className="absolute top-8 bottom-8 left-[35px] w-px bg-hairline" />
        {rows.map((row, index) => (
          <li
            key={row.title}
            className={cn(
              "relative flex animate-ledger-in gap-4 py-3.5 motion-reduce:animate-none",
              RowDelays[Math.min(index, RowDelays.length - 1)],
            )}
          >
            <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-strong ring-4 ring-surface-card">
              <row.icon className="size-4 text-ink" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] leading-tight font-medium text-ink">{row.title}</p>
              <p className="mt-1 text-sm leading-snug text-muted-ink">{row.detail}</p>
              {row.waveform ? <MiniWaveform /> : null}
            </div>
            <span className="pt-0.5 text-sm text-muted-soft tabular-nums">{row.time}</span>
          </li>
        ))}
      </ol>
    </figure>
  );
}
