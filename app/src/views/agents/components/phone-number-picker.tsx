"use client";

import { useState, type FC } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { PhoneIcon, PlusIcon } from "lucide-react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { PhoneNumberSourceOptions } from "@/config/constants/dropdowns/phone-numbers/phone-number-source.options";
import { useAssignPhoneNumberAgent, useGetPhoneNumbers } from "@/features/phone-numbers/hooks/use-phone-numbers";
import { PhoneNumberStatuses, type PhoneNumber } from "@/features/phone-numbers/interfaces/phone-numbers.interfaces";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";
import { cn } from "@/lib/utils";
import { Routes } from "@/routes/routes";
import { AddPhoneNumberDialog } from "@/views/phone-numbers/components/add-phone-number-dialog";
import { PhoneNumberStatusBadge } from "@/views/phone-numbers/components/phone-number-status-badge";

const NUMBER_LIMIT = 100;

interface PhoneNumberPickerProps {
  agentId: string;
  /** Whether the caller may assign numbers and add new ones. */
  canManage: boolean;
}

/**
 * The active numbers this agent can use: the ones assigned to it and the ones nobody uses yet.
 * Assigning and removing happen right away, and new numbers are added through the shared dialog.
 */
export const PhoneNumberPicker: FC<PhoneNumberPickerProps> = ({ agentId, canManage }) => {
  const numbers = useGetPhoneNumbers({ status: PhoneNumberStatuses.ACTIVE, limit: NUMBER_LIMIT });
  const assign = useAssignPhoneNumberAgent();
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  // The agent's overview and readiness show its numbers, so they are refreshed whenever the numbers change.
  const refreshAgent = () => queryClient.invalidateQueries({ queryKey: ["agent"] });

  const setAssignment = (phone: PhoneNumber, assignTo: string | null) => {
    setPendingId(phone.id);
    assign.mutate(
      { id: phone.id, agent_uuid: assignTo },
      {
        onSuccess: refreshAgent,
        onSettled: () => setPendingId(null),
      },
    );
  };

  if (numbers.isPending) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (numbers.isError) {
    return (
      <ErrorState title="Could not load your numbers" message={numbers.error.message} onRetry={() => numbers.refetch()} />
    );
  }

  const usable = numbers.data.data.filter((phone) => !phone.agent || phone.agent.id === agentId);

  return (
    <div className="flex flex-col gap-4">
      {usable.length === 0 ? (
        <EmptyState
          icon={PhoneIcon}
          title="No numbers available"
          description="Get a new number or bring your own. Numbers already used by another agent are managed from Phone numbers."
          action={
            canManage ? (
              <Button onClick={() => setAddOpen(true)}>
                <PlusIcon aria-hidden="true" />
                Add a phone number
              </Button>
            ) : undefined
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {usable.map((phone) => {
            const isMine = phone.agent?.id === agentId;
            return (
              <li
                key={phone.id}
                className={cn(
                  "flex flex-wrap items-center gap-3 rounded-xl border bg-card p-3.5",
                  isMine ? "border-foreground" : "border-border",
                )}
              >
                <span
                  aria-hidden="true"
                  className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-secondary"
                >
                  <PhoneIcon className="size-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium tabular-nums">{phone.number}</p>
                  <p className="text-sm text-muted-foreground">
                    {[phone.label, getDropdownOptionLabel(PhoneNumberSourceOptions, phone.source)]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <PhoneNumberStatusBadge status={phone.status} />
                {canManage ? (
                  isMine ? (
                    <ActionButtonWithPending
                      variant="outline"
                      size="sm"
                      isPending={pendingId === phone.id}
                      onClick={() => setAssignment(phone, null)}
                    >
                      Remove from this agent
                    </ActionButtonWithPending>
                  ) : (
                    <ActionButtonWithPending
                      size="sm"
                      isPending={pendingId === phone.id}
                      onClick={() => setAssignment(phone, agentId)}
                    >
                      Use for this agent
                    </ActionButtonWithPending>
                  )
                ) : isMine ? (
                  <span className="text-sm text-muted-foreground">Assigned</span>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          The number is used for both inbound and outbound calls for this agent. A number you bring yourself stays
          pending until your carrier is connected.
        </p>
        <div className="flex gap-2">
          {canManage && usable.length > 0 ? (
            <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
              <PlusIcon aria-hidden="true" />
              Add a phone number
            </Button>
          ) : null}
          <Link href={Routes.phoneNumbers} className="inline-flex items-center text-sm underline underline-offset-4">
            All phone numbers
          </Link>
        </div>
      </div>

      <AddPhoneNumberDialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open);
          if (!open) void refreshAgent();
        }}
        defaultAgentId={agentId}
      />
    </div>
  );
};
