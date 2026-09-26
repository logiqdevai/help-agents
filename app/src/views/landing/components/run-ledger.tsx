import {
  CalendarDaysIcon,
  CheckIcon,
  ContactIcon,
  DatabaseIcon,
  InboxIcon,
  MailIcon,
  MicIcon,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Static heights (in a 48-unit box) for the mini call waveform.
const WaveformHeights = [8, 16, 26, 14, 34, 22, 40, 18, 28, 12, 36, 24, 16, 30, 10, 20];

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

interface LedgerRow {
  icon: LucideIcon;
  title: string;
  detail: string;
  time: string;
  delay: string;
  waveform?: boolean;
}

// Tailwind needs full class names, so each row's delay is spelled out.
const LedgerRows: LedgerRow[] = [
  {
    icon: InboxIcon,
    title: "New lead",
    detail: "Website form: Nikos A. asked for a quote",
    time: "09:02",
    delay: "[animation-delay:600ms]",
  },
  {
    icon: DatabaseIcon,
    title: "Read the CRM record",
    detail: "Matched to an existing contact and an open deal",
    time: "09:02",
    delay: "[animation-delay:1150ms]",
  },
  {
    icon: MicIcon,
    title: "Called the lead",
    detail: "2 min 14 s. Interested, timeline confirmed",
    time: "09:03",
    delay: "[animation-delay:1700ms]",
    waveform: true,
  },
  {
    icon: MailIcon,
    title: "Sent a follow-up email",
    detail: "Options and pricing summary",
    time: "09:06",
    delay: "[animation-delay:2250ms]",
  },
  {
    icon: CalendarDaysIcon,
    title: "Booked Thursday, 11:00",
    detail: "Confirmation sent by message",
    time: "09:06",
    delay: "[animation-delay:2800ms]",
  },
  {
    icon: ContactIcon,
    title: "Updated the CRM",
    detail: "Stage, call notes and next step",
    time: "09:06",
    delay: "[animation-delay:3350ms]",
  },
];

/** The hero's memorable moment: one lead handled across voice, email and messaging, written line by line on load. */
export function RunLedger({ className }: { className?: string }) {
  return (
    <figure
      aria-label="Example: one new lead handled across voice, email and messaging"
      className={cn(
        "relative overflow-hidden rounded-2xl border border-hairline bg-surface-card shadow-[0_4px_16px_rgba(0,0,0,0.04)]",
        className,
      )}
    >
      <figcaption className="flex items-center justify-between gap-4 border-b border-hairline-soft px-5 py-4">
        <span className="text-[15px] font-medium text-ink">Example run</span>
        <span className="inline-flex animate-ledger-in items-center gap-1.5 rounded-full bg-surface-strong px-2.5 py-1 text-[13px] font-medium text-ink [animation-delay:3600ms] motion-reduce:animate-none">
          <CheckIcon className="size-3.5 text-semantic-success" aria-hidden />
          Done in 4 minutes
        </span>
      </figcaption>
      <ol className="relative px-5 py-2">
        <span aria-hidden className="absolute top-8 bottom-8 left-[35px] w-px bg-hairline" />
        {LedgerRows.map((row) => (
          <li
            key={row.title}
            className={cn("relative flex animate-ledger-in gap-4 py-3.5 motion-reduce:animate-none", row.delay)}
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
