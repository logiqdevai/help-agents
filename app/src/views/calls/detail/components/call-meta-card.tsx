import type { FC, ReactNode } from "react";
import Link from "next/link";
import { ExternalLinkIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CallDirectionFormOptions } from "@/config/constants/dropdowns/calls/call-direction-form.options";
import { CallStatusFormOptions } from "@/config/constants/dropdowns/calls/call-status-form.options";
import {
  CallDirections,
  CallStatuses,
  LiveCallStatuses,
  type CallDetail,
} from "@/features/calls/interfaces/calls.interfaces";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";
import { formatClock, formatMoney, formatTime } from "@/lib/format";
import { Routes } from "@/routes/routes";
import { formatTimeWithSeconds, getCustomerNumber } from "@/views/calls/utils/call-format";

const MetaItem: FC<{ label: string; sub?: ReactNode; children: ReactNode }> = ({ label, sub, children }) => (
  <div className="min-w-0">
    <dt className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{label}</dt>
    <dd className="mt-1 font-medium">
      {children}
      {sub ? <span className="mt-0.5 block text-[13px] font-normal text-muted-foreground">{sub}</span> : null}
    </dd>
  </div>
);

interface CallMetaCardProps {
  call: CallDetail;
}

export const CallMetaCard: FC<CallMetaCardProps> = ({ call }) => {
  const isLive = LiveCallStatuses.includes(call.status);
  const isInbound = call.direction === CallDirections.INBOUND;
  const contactName = call.contact?.name ?? call.contact_name;
  const otherNumber = isInbound ? call.to_number : call.from_number;

  return (
    <Card>
      <CardContent>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-4">
          <MetaItem label="Agent" sub={getDropdownOptionLabel(CallDirectionFormOptions, call.direction)}>
            <Link href={Routes.agents.detail(call.agent.id)} className="underline-offset-4 hover:underline">
              {call.agent.name}
            </Link>
          </MetaItem>
          <MetaItem
            label="Contact"
            sub={call.contact?.integration ? call.contact.integration.name : "Not in CRM"}
          >
            {contactName ?? <span className="text-muted-foreground">Unknown caller</span>}
            {call.contact?.external_url ? (
              <a
                href={call.contact.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1.5 inline-flex align-middle text-muted-foreground hover:text-foreground"
                aria-label="Open the record in your CRM"
              >
                <ExternalLinkIcon className="size-3.5" />
              </a>
            ) : null}
          </MetaItem>
          <MetaItem
            label="Phone"
            sub={otherNumber ? `${isInbound ? "Called" : "From"} ${otherNumber}` : undefined}
          >
            <span className="tabular-nums">{getCustomerNumber(call) ?? "—"}</span>
          </MetaItem>
          <MetaItem
            label="Started"
            sub={call.answered_at ? `Answered ${formatTimeWithSeconds(call.answered_at)}` : undefined}
          >
            {formatTime(call.started_at ?? call.created_at)}
          </MetaItem>
          <MetaItem label="Duration">
            <span className="tabular-nums">{formatClock(call.duration_seconds)}</span>
          </MetaItem>
          <MetaItem
            label="Status"
            sub={
              call.status === CallStatuses.TRANSFERRED
                ? [call.transferred_to && `To ${call.transferred_to}`, call.transfer_reason].filter(Boolean).join(" · ") ||
                  "Handed to a team member"
                : call.in_voicemail
                  ? "Reached voicemail"
                  : undefined
            }
          >
            {getDropdownOptionLabel(CallStatusFormOptions, call.status)}
          </MetaItem>
          <MetaItem
            label="Outcome"
            sub={
              call.outcome?.is_successful === true
                ? "Success outcome"
                : call.outcome?.is_successful === false
                  ? "Not a success outcome"
                  : undefined
            }
          >
            {call.outcome ? call.outcome.label : <span className="text-muted-foreground">{isLive ? "Pending" : "—"}</span>}
          </MetaItem>
          <MetaItem label="Cost">
            <span className="tabular-nums">
              {isLive ? <span className="text-muted-foreground">—</span> : formatMoney(call.total_cost, call.currency)}
            </span>
          </MetaItem>
        </dl>
      </CardContent>
    </Card>
  );
};
