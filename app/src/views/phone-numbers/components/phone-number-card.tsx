"use client";

import type { FC } from "react";
import Link from "next/link";
import { BotIcon, EllipsisIcon, PencilIcon, PhoneForwardedIcon, RepeatIcon, SparklesIcon, Trash2Icon, TriangleAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PhoneNumberSourceOptions } from "@/config/constants/dropdowns/phone-numbers/phone-number-source.options";
import {
  PhoneNumberSources,
  PhoneNumberStatuses,
  type PhoneNumber,
} from "@/features/phone-numbers/interfaces/phone-numbers.interfaces";
import { formatDate, formatNumber } from "@/lib/format";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";
import { cn } from "@/lib/utils";
import { Routes } from "@/routes/routes";
import { PhoneNumberStatusBadge } from "./phone-number-status-badge";

interface PhoneNumberCardProps {
  phone: PhoneNumber;
  /** Whether the viewer may change numbers; without it the card is read-only. */
  canManage: boolean;
  onEditLabel: (phone: PhoneNumber) => void;
  onAssign: (phone: PhoneNumber) => void;
  onUnassign: (phone: PhoneNumber) => void;
  onRelease: (phone: PhoneNumber) => void;
}

export const PhoneNumberCard: FC<PhoneNumberCardProps> = ({
  phone,
  canManage,
  onEditLabel,
  onAssign,
  onUnassign,
  onRelease,
}) => {
  const isOwn = phone.source === PhoneNumberSources.BYO;
  const isActive = phone.status === PhoneNumberStatuses.ACTIVE;
  const isError = phone.status === PhoneNumberStatuses.ERROR;
  const SourceIcon = isOwn ? PhoneForwardedIcon : SparklesIcon;
  const setup = phone.setup;

  return (
    <Card className={cn("gap-0 py-0", isError && "ring-destructive/30")}>
      <div className="flex items-start justify-between gap-3 px-6 pt-6">
        <div className="min-w-0">
          <p className="font-display text-[28px] leading-tight font-light tracking-tight tabular-nums">{phone.number}</p>
          <p className="mt-1 truncate text-sm text-muted-foreground">{phone.label ?? "No label"}</p>
        </div>
        <PhoneNumberStatusBadge status={phone.status} />
      </div>

      <div className="flex flex-col gap-2.5 px-6 pt-4 pb-5">
        <p className="flex items-center gap-2 text-sm">
          <SourceIcon className="size-4 text-muted-foreground" aria-hidden="true" />
          {getDropdownOptionLabel(PhoneNumberSourceOptions, phone.source)}
        </p>
        <p className="flex items-center gap-2 text-sm">
          <BotIcon className="size-4 text-muted-foreground" aria-hidden="true" />
          {phone.agent ? (
            <Link href={Routes.agents.detail(phone.agent.id)} className="font-medium hover:underline">
              {phone.agent.name}
            </Link>
          ) : (
            <span className="text-muted-foreground">Not assigned to an agent</span>
          )}
        </p>

        {phone.last_error && !isActive ? (
          <div
            className="mt-1 flex gap-2.5 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm"
            role="alert"
          >
            <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
            <p>
              <strong className="font-medium">Could not activate this number.</strong> {phone.last_error}
            </p>
          </div>
        ) : null}

        {setup?.inbound_sip_address ? (
          <div className="mt-1 rounded-lg bg-muted p-3 text-sm">
            <p className="font-medium">Carrier setup</p>
            <p className="text-muted-foreground">
              In your carrier&apos;s dashboard, send calls for this number to this address.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-md bg-background px-2 py-1 font-mono text-xs">
                {setup.inbound_sip_address}
              </code>
              <CopyButton
                variant="ghost"
                size="icon-sm"
                aria-label="Copy the address for your carrier"
                value={setup.inbound_sip_address}
              />
            </div>
            {setup.termination_uri ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Outbound calls go through your trunk at{" "}
                <span className="font-mono text-foreground">{setup.termination_uri}</span>.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2.5 border-t border-border px-6 py-3.5">
        <span className="text-sm text-muted-foreground">
          Added {formatDate(phone.created_at)} · {formatNumber(phone.call_count)}{" "}
          {phone.call_count === 1 ? "call" : "calls"}
        </span>
        {canManage ? (
          <span className="flex items-center gap-1.5">
            {isActive ? (
              phone.agent ? (
                <Button variant="outline" size="sm" onClick={() => onUnassign(phone)}>
                  Unassign
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => onAssign(phone)}>
                  Assign agent
                </Button>
              )
            ) : null}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="ghost" size="icon-sm" aria-label={`More actions for ${phone.number}`} />}
              >
                <EllipsisIcon aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onClick={() => onEditLabel(phone)}>
                  <PencilIcon aria-hidden="true" />
                  Edit label
                </DropdownMenuItem>
                {isActive && phone.agent ? (
                  <DropdownMenuItem onClick={() => onAssign(phone)}>
                    <RepeatIcon aria-hidden="true" />
                    Assign to another agent
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => onRelease(phone)}>
                  <Trash2Icon aria-hidden="true" />
                  {isOwn ? "Remove number" : "Release number"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </span>
        ) : null}
      </div>
    </Card>
  );
};
