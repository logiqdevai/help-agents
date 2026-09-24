"use client";

import type { FC } from "react";
import { MailCheckIcon, MailWarningIcon } from "lucide-react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, StatusTones } from "@/components/ui/status-badge";
import { useGetProfile, useResendVerification } from "@/features/auth/hooks/use-auth";

export const EmailVerificationCard: FC = () => {
  const profile = useGetProfile();
  const resend = useResendVerification();

  if (profile.isPending) return <Skeleton className="h-24 w-full rounded-xl" />;
  if (profile.isError) {
    return (
      <ErrorState
        title="Could not load your account"
        message={profile.error.message}
        onRetry={() => profile.refetch()}
      />
    );
  }

  const { email, email_verified: verified } = profile.data.user;
  const Icon = verified ? MailCheckIcon : MailWarningIcon;

  return (
    <Card className="flex-row flex-wrap items-center justify-between gap-4 px-5 py-5 md:px-6">
      <div className="flex min-w-0 items-center gap-3.5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary">
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="font-medium">Email verification</p>
          <p className="truncate text-sm text-muted-foreground">
            {verified ? `${email} is verified.` : `${email} has not been verified yet.`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {verified ? null : (
          <ActionButtonWithPending variant="outline" isPending={resend.isPending} onClick={() => resend.mutate()}>
            Resend verification email
          </ActionButtonWithPending>
        )}
        <StatusBadge tone={verified ? StatusTones.SUCCESS : StatusTones.WARNING} dot>
          {verified ? "Verified" : "Not verified"}
        </StatusBadge>
      </div>
    </Card>
  );
};
