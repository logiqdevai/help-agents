"use client";

import type { FC } from "react";
import { useState } from "react";
import { MailIcon } from "lucide-react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanyRoleFormOptions } from "@/config/constants/dropdowns/users/company-role-form.options";
import type { CompanyRole } from "@/features/auth/interfaces/auth.interfaces";
import {
  useGetInvitations,
  useResendInvitation,
  useRevokeInvitation,
} from "@/features/team/hooks/use-team";
import { InvitationStatuses, type TeamInvitation } from "@/features/team/interfaces/team.interfaces";
import { canManageRole } from "@/features/team/utils/team-policy.utils";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";
import { formatDate } from "@/lib/format";

interface InvitationsSectionProps {
  myRole: CompanyRole | undefined;
  canManageTeam: boolean;
}

export const InvitationsSection: FC<InvitationsSectionProps> = ({ myRole, canManageTeam }) => {
  const invitations = useGetInvitations({ status: InvitationStatuses.PENDING, limit: 100 });
  const resend = useResendInvitation();
  const revoke = useRevokeInvitation();
  const [revoking, setRevoking] = useState<TeamInvitation | null>(null);

  return (
    <section className="flex flex-col gap-3" aria-labelledby="pending-invitations-heading">
      <h2 id="pending-invitations-heading" className="font-heading text-lg font-medium">
        Pending invitations
      </h2>
      {invitations.isPending ? <Skeleton className="h-20 w-full rounded-xl" /> : null}
      {invitations.isError ? (
        <ErrorState
          title="Could not load invitations"
          message={invitations.error.message}
          onRetry={() => invitations.refetch()}
        />
      ) : null}
      {invitations.data ? (
        invitations.data.data.length === 0 ? (
          <Card className="px-5 py-4 text-sm text-muted-foreground">No pending invitations.</Card>
        ) : (
          <Card className="gap-0 py-0">
            <ul className="divide-y divide-border">
              {invitations.data.data.map((invitation) => {
                const manageable = canManageTeam && canManageRole(myRole, invitation.role);
                const inviter = invitation.invited_by?.name ?? invitation.invited_by?.email;
                return (
                  <li key={invitation.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                    <Avatar>
                      <AvatarFallback>
                        <MailIcon className="size-4" aria-hidden />
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1 basis-56">
                      <p className="truncate font-medium">{invitation.email}</p>
                      <p className="text-muted-foreground">
                        {getDropdownOptionLabel(CompanyRoleFormOptions, invitation.role)}
                        {inviter ? ` · invited by ${inviter}` : ""} · expires {formatDate(invitation.expires_at)}
                      </p>
                    </div>
                    {manageable ? (
                      <div className="flex items-center gap-1">
                        <ActionButtonWithPending
                          variant="outline"
                          size="sm"
                          isPending={resend.isPending && resend.variables === invitation.id}
                          onClick={() => resend.mutate(invitation.id)}
                        >
                          Resend
                        </ActionButtonWithPending>
                        <Button variant="ghost" size="sm" onClick={() => setRevoking(invitation)}>
                          Revoke
                        </Button>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </Card>
        )
      ) : null}
      <ConfirmationDialog
        open={!!revoking}
        onOpenChange={(open) => !open && setRevoking(null)}
        title="Revoke this invitation?"
        description={`${revoking?.email ?? "This person"} will no longer be able to join with the link they were sent.`}
        confirmLabel="Revoke"
        isPending={revoke.isPending}
        onConfirm={() => (revoking ? revoke.mutateAsync(revoking.id) : undefined)}
      />
    </section>
  );
};
