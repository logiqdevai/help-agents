"use client";

import type { FC } from "react";
import Link from "next/link";
import { ClockIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Permissions } from "@/config/constants/permissions";
import { useGetCallingHours } from "@/features/scheduled-calls/hooks/use-scheduled-calls";
import { usePermissions } from "@/hooks/use-permissions";
import { cn } from "@/lib/utils";
import { Routes } from "@/routes/routes";
import { summarizeCallingHours } from "@/views/calls/utils/calling-hours";

interface CallingHoursNoticeProps {
  className?: string;
  /** Show the "Change calling hours" link (page banner only). */
  showSettingsLink?: boolean;
}

/** Tells the user when calls can be placed; anything scheduled outside is moved to the next allowed time. */
export const CallingHoursNotice: FC<CallingHoursNoticeProps> = ({ className, showSettingsLink = false }) => {
  const hours = useGetCallingHours();
  const { can } = usePermissions();

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border border-border bg-muted/60 px-4 py-3 text-sm leading-relaxed",
        className,
      )}
    >
      <ClockIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      {hours.isPending ? (
        <Skeleton className="h-4 w-full max-w-md" />
      ) : (
        <p className="min-w-0">
          {hours.data ? (
            <>
              <span className="font-medium">Calling hours:</span> {summarizeCallingHours(hours.data).join(", ")} ·{" "}
              {hours.data.timezone}.{" "}
            </>
          ) : (
            <>Calls are only placed within your company&apos;s calling hours. </>
          )}
          Calls that fall outside these hours are moved to the next allowed time automatically.{" "}
          {showSettingsLink && can(Permissions.COMPANY_MANAGE) ? (
            <Link
              href={Routes.settings.organization}
              className="text-foreground underline underline-offset-4"
            >
              Change calling hours
            </Link>
          ) : null}
        </p>
      )}
    </div>
  );
};
