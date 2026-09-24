"use client";

import type { FC } from "react";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Permissions } from "@/config/constants/permissions";
import { useGetCallingHours, useGetCompany } from "@/features/company/hooks/use-company";
import { usePermissions } from "@/hooks/use-permissions";
import { CallingHoursCard } from "./components/calling-hours-card";
import { CallingStatusPanel } from "./components/calling-status-panel";
import { CompanyDetailsCard } from "./components/company-details-card";
import { DangerZoneCard } from "./components/danger-zone-card";
import { RecordingRetentionCard } from "./components/recording-retention-card";

const OrganizationSkeleton: FC = () => (
  <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]" aria-busy="true">
    <div className="flex flex-col gap-6">
      <Skeleton className="h-80 w-full rounded-xl" />
      <Skeleton className="h-[34rem] w-full rounded-xl" />
      <Skeleton className="h-52 w-full rounded-xl" />
    </div>
    <div className="flex flex-col gap-4">
      <Skeleton className="h-48 w-full rounded-3xl" />
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  </div>
);

const OrganizationSettingsPage: FC = () => {
  const { can } = usePermissions();
  const canEdit = can(Permissions.COMPANY_MANAGE);
  const company = useGetCompany();
  const callingHours = useGetCallingHours();

  if (company.isPending || callingHours.isPending) return <OrganizationSkeleton />;

  if (company.isError || callingHours.isError) {
    return (
      <ErrorState
        title="Could not load organization settings"
        message={(company.error ?? callingHours.error)?.message}
        onRetry={() => {
          if (company.isError) company.refetch();
          if (callingHours.isError) callingHours.refetch();
        }}
      />
    );
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="flex min-w-0 flex-col gap-6">
        <CompanyDetailsCard company={company.data} canEdit={canEdit} />
        <CallingHoursCard hours={callingHours.data} canEdit={canEdit} />
        <RecordingRetentionCard company={company.data} canEdit={canEdit} />
        <DangerZoneCard companyName={company.data.name} />
      </div>
      <aside className="flex flex-col gap-4">
        <CallingStatusPanel hours={callingHours.data} />
        <Card className="gap-3 p-5">
          <p className="font-medium">Good to know</p>
          <p className="text-sm text-muted-foreground">
            The platform never places an automated call outside these hours, even for retries and follow-ups.
          </p>
          <p className="text-sm text-muted-foreground">
            Each company is fully isolated: your team, agents, CRM connections and call history are never visible to
            another company.
          </p>
        </Card>
      </aside>
    </div>
  );
};

export default OrganizationSettingsPage;
