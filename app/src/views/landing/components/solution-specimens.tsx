import { ArrowDownIcon, CheckIcon, MicIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const specimenShell =
  "relative overflow-hidden rounded-xl border border-hairline bg-surface-card shadow-[0_4px_16px_rgba(0,0,0,0.04)]";

// Static heights (in a 48-unit box) for the call waveform.
const WaveformHeights = [
  6, 14, 24, 12, 30, 20, 38, 16, 26, 10, 34, 22, 14, 28, 8, 18, 36, 24, 12, 32, 20, 40, 14, 26, 10, 22, 30, 16, 8, 24,
  34, 12, 20, 28, 10, 18, 26, 14, 8, 16,
];

function ResultChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-strong px-3 py-1 text-[13px] font-medium text-ink">
      <CheckIcon className="size-3.5 text-semantic-success" aria-hidden />
      {children}
    </span>
  );
}

export function VoiceSpecimen({ className }: { className?: string }) {
  return (
    <div aria-label="Example: an outbound call handled by the AI voice agent" className={cn(specimenShell, className)}>
      <div className="flex items-center gap-3 border-b border-hairline-soft px-5 py-4">
        <span className="flex size-8 items-center justify-center rounded-full bg-surface-strong">
          <MicIcon className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] leading-tight font-medium text-ink">Outbound call</p>
          <p className="text-sm text-muted-ink">Follow-up on a new lead</p>
        </div>
        <span className="text-sm text-muted-ink tabular-nums">02:14</span>
      </div>
      <svg aria-hidden viewBox="0 0 320 48" className="h-12 w-full px-5 text-ink" preserveAspectRatio="none">
        {WaveformHeights.map((height, i) => (
          <rect
            key={i}
            x={i * 8}
            y={(48 - height) / 2}
            width={4}
            height={height}
            rx={2}
            fill="currentColor"
            opacity={i < 26 ? 0.85 : 0.2}
          />
        ))}
      </svg>
      <div className="flex flex-col gap-3 px-5 pt-2 pb-5 text-[15px] leading-snug">
        <p className="text-ink">
          <span className="mr-2 text-muted-ink">Agent</span>
          Hi Nikos, I&rsquo;m calling about the quote you requested. Is now a good time?
        </p>
        <p className="text-ink">
          <span className="mr-2 text-muted-ink">Lead</span>
          Yes, go ahead.
        </p>
        <p className="text-ink">
          <span className="mr-2 text-muted-ink">Agent</span>
          Great. What would you like the quote to cover?
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <ResultChip>Qualified</ResultChip>
          <ResultChip>Meeting booked</ResultChip>
          <ResultChip>CRM updated</ResultChip>
        </div>
      </div>
    </div>
  );
}

const ExtractedFields = [
  { label: "Request", value: "Move Friday's meeting" },
  { label: "New time", value: "Tuesday afternoon" },
  { label: "Task", value: "Send the updated proposal" },
];

export function EmailSpecimen({ className }: { className?: string }) {
  return (
    <div aria-label="Example: an incoming email turned into actions" className={cn(specimenShell, className)}>
      <div className="border-b border-hairline-soft px-5 py-4">
        <p className="text-[15px] leading-tight font-medium text-ink">Can we move Friday&rsquo;s meeting?</p>
        <p className="mt-1 text-sm text-muted-ink">From Elena K.</p>
        <p className="mt-3 text-[15px] leading-snug text-body">
          Hi, could we move to next Tuesday afternoon instead? Please also send over the updated proposal before then.
        </p>
      </div>
      <div className="flex justify-center py-3 text-muted-soft">
        <ArrowDownIcon className="size-4" aria-hidden />
      </div>
      <dl className="px-5">
        {ExtractedFields.map((field) => (
          <div key={field.label} className="flex items-baseline justify-between gap-4 border-t border-hairline-soft py-3">
            <dt className="text-sm text-muted-ink">{field.label}</dt>
            <dd className="text-[15px] font-medium text-ink">{field.value}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-wrap gap-2 border-t border-hairline-soft px-5 py-4">
        <ResultChip>Calendar updated</ResultChip>
        <ResultChip>Owner notified</ResultChip>
      </div>
    </div>
  );
}

const ChatMessages = [
  { from: "customer", text: "Do you have anything available on Thursday?" },
  { from: "agent", text: "Yes, 11:00 or 15:30. Want me to book one of them?" },
  { from: "customer", text: "11:00 please." },
  { from: "agent", text: "Booked for Thursday at 11:00. I've sent a confirmation to your email." },
] as const;

export function MessagingSpecimen({ className }: { className?: string }) {
  return (
    <div aria-label="Example: a customer conversation handled by the AI messaging agent" className={cn(specimenShell, className)}>
      <div className="flex flex-col gap-2.5 px-5 py-5">
        {ChatMessages.map((message) => (
          <p
            key={message.text}
            className={cn(
              "max-w-[82%] rounded-2xl px-4 py-2.5 text-[15px] leading-snug",
              message.from === "customer"
                ? "self-end rounded-br-md bg-primary text-primary-foreground"
                : "self-start rounded-bl-md bg-surface-strong text-ink",
            )}
          >
            {message.text}
          </p>
        ))}
      </div>
      <p className="border-t border-hairline-soft px-5 py-3.5 text-sm text-muted-ink">
        Answered from your calendar and knowledge base
      </p>
    </div>
  );
}
