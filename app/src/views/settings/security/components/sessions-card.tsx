"use client";

import type { FC } from "react";
import { useState } from "react";
import { LaptopIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { StatusBadge, StatusTones } from "@/components/ui/status-badge";
import { useLogout } from "@/features/auth/hooks/use-auth";
import { useAuthStore } from "@/stores/auth";
import { SettingsCard } from "../../components/settings-card";

// Sessions are stateless tokens, so the platform cannot list or revoke other devices; only this browser's
// session is known. The card says so instead of inventing a device list.
export const SessionsCard: FC = () => {
  const email = useAuthStore((state) => state.user?.email);
  const logout = useLogout();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <SettingsCard
      title="Where you are signed in"
      description="You can be logged in on several devices at once."
      flush
      footer={
        <p className="text-sm text-muted-foreground">
          Each browser or device keeps its own session. Signing out here only ends the session in this browser; on a
          lost device, change your password.
        </p>
      }
    >
      <div className="flex flex-wrap items-center gap-3.5 px-5 py-4 md:px-6">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary">
          <LaptopIcon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1 basis-56">
          <p className="flex flex-wrap items-center gap-2 font-medium">
            Current session <StatusBadge tone={StatusTones.SUCCESS}>This device</StatusBadge>
          </p>
          <p className="truncate text-sm text-muted-foreground">Signed in as {email}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setConfirmOpen(true)}>
          Sign out
        </Button>
      </div>
      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        variant="default"
        title="Sign out of this device?"
        description="You will need to log in again to keep using the platform in this browser."
        confirmLabel="Sign out"
        isPending={logout.isPending}
        onConfirm={() => logout.mutateAsync()}
      />
    </SettingsCard>
  );
};
