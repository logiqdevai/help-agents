import type { FC } from "react";
import { RefreshCwIcon, ShieldCheckIcon, TriangleAlertIcon } from "lucide-react";
import { SectionCard } from "@/components/ui/section-card";
import { CrmRetryScheduleOptions } from "@/config/constants/dropdowns/alerts/crm-retry-schedule.options";

/** Explains what happens when a CRM update fails, plus the reassurance that nothing is lost. */
export const RetryScheduleCard: FC = () => (
  <div className="flex flex-col gap-4">
    <SectionCard title="CRM update retry schedule" description="When a CRM update fails, we retry automatically.">
      <ol className="flex flex-col gap-4">
        {CrmRetryScheduleOptions.map((step) => (
          <li key={step.id} className="flex items-center gap-3 text-sm">
            <span
              aria-hidden="true"
              className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground"
            >
              <RefreshCwIcon className="size-3.5" />
            </span>
            <span>
              <span className="font-medium">Retry {step.id}</span> {step.label}
            </span>
          </li>
        ))}
        <li className="flex items-start gap-3 text-sm">
          <span
            aria-hidden="true"
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive"
          >
            <TriangleAlertIcon className="size-3.5" />
          </span>
          <span>
            <span className="font-medium">Needs attention</span>
            <br />
            <span className="text-muted-foreground">
              Flagged here so someone can look into it. You can retry manually at any time.
            </span>
          </span>
        </li>
      </ol>
    </SectionCard>
    <div className="flex items-start gap-3 rounded-xl border border-border bg-muted px-4 py-3.5 text-sm leading-relaxed">
      <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <p>
        <span className="font-medium">Nothing is lost.</span>{" "}
        <span className="text-muted-foreground">
          A failed CRM update never affects the call itself. The transcript, summary and outcome stay saved and
          visible.
        </span>
      </p>
    </div>
  </div>
);
