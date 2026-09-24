"use client";

import type { FC } from "react";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetProfile } from "@/features/auth/hooks/use-auth";
import { CompaniesCard } from "./components/companies-card";
import { ProfileCard } from "./components/profile-card";

const AccountSettingsPage: FC = () => {
  const profile = useGetProfile();

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      {profile.isPending ? (
        <Skeleton className="h-[34rem] w-full rounded-xl" aria-busy="true" />
      ) : profile.isError ? (
        <ErrorState
          title="Could not load your profile"
          message={profile.error.message}
          onRetry={() => profile.refetch()}
        />
      ) : (
        <ProfileCard user={profile.data.user} />
      )}
      <CompaniesCard />
    </div>
  );
};

export default AccountSettingsPage;
