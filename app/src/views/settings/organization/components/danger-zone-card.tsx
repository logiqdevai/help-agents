"use client";

import type { FC } from "react";
import { useState } from "react";
import { InfoIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Permissions } from "@/config/constants/permissions";
import { useCancelCompanyDeletion, useGetDeletionStatus } from "@/features/company/hooks/use-company";
import { usePermissions } from "@/hooks/use-permissions";
import { formatDate } from "@/lib/format";
import { RequestDeletionDialog } from "./request-deletion-dialog";

interface DangerZoneCardProps {
  companyName: string;
}

export const DangerZoneCard: FC<DangerZoneCardProps> = ({ companyName }) => {
  const { can } = usePermissions();
  const canDelete = can(Permissions.COMPANY_DELETE);
  const status = useGetDeletionStatus();
  const cancelDeletion = useCancelCompanyDeletion();
  const [requestOpen, setRequestOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const gracePeriodDays = status.data?.grace_period_days;

  return (
    <Card className="gap-0 py-0 ring-destructive/30">
      <div className="border-b border-border px-5 py-4 md:px-6 md:py-5">
        <h3 className="font-heading text-base font-medium">Delete account and data</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Request full deletion of {companyName} and everything in it.
        </p>
      </div>
      <div className="flex flex-col gap-4 px-5 py-5 md:px-6">
        {status.isPending ? <Skeleton className="h-24 w-full rounded-lg" /> : null}
        {status.isError ? (
          <ErrorState title="Could not load the deletion status" message={status.error.message} onRetry={() => status.refetch()} />
        ) : null}
        {status.data ? (
          <>
            <p className="text-sm">
              Deletion removes your agents, knowledge, CRM connections, call history, recordings and team access.
              We start a {status.data.grace_period_days}-day grace period after you request it, so an accidental
              request can be cancelled. After that, the data is permanently erased.
            </p>
            <div className="flex gap-2.5 rounded-lg bg-muted p-3 text-sm" role="status">
              <InfoIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
              {status.data.deletion_requested ? (
                <p>
                  <strong className="font-medium">
                    Deletion requested on {formatDate(status.data.requested_at)}.
                  </strong>{" "}
                  All data will be permanently erased on {formatDate(status.data.scheduled_purge_at)} unless the
                  request is cancelled before then.
                </p>
              ) : (
                <p>
                  <strong className="font-medium">Status: no deletion requested.</strong> If you request deletion,
                  this card will show the date it was requested and a “Cancel request” button until the grace
                  period ends.
                </p>
              )}
            </div>
            {canDelete ? (
              <div>
                {status.data.deletion_requested ? (
                  <Button variant="outline" onClick={() => setCancelOpen(true)}>
                    Cancel request
                  </Button>
                ) : (
                  <Button variant="destructive" onClick={() => setRequestOpen(true)}>
                    <Trash2Icon /> Request deletion
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Only the company owner can request or cancel deletion.</p>
            )}
          </>
        ) : null}
      </div>
      {gracePeriodDays !== undefined ? (
        <>
          <RequestDeletionDialog
            open={requestOpen}
            onOpenChange={setRequestOpen}
            companyName={companyName}
            gracePeriodDays={gracePeriodDays}
          />
          <ConfirmationDialog
            open={cancelOpen}
            onOpenChange={setCancelOpen}
            variant="default"
            title="Cancel the deletion request?"
            description={`${companyName} and all of its data will be kept.`}
            confirmLabel="Cancel request"
            cancelLabel="Keep request"
            isPending={cancelDeletion.isPending}
            onConfirm={() => cancelDeletion.mutateAsync()}
          />
        </>
      ) : null}
    </Card>
  );
};
