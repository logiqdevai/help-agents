"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Routes } from "@/routes/routes";
import { useAuthStore } from "@/stores/auth";

const subscribeToHydration = (onChange: () => void) => useAuthStore.persist.onFinishHydration(onChange);
const getHydrated = () => useAuthStore.persist.hasHydrated();

/** True once the persisted auth state has been read from localStorage (false on the server). */
export function useAuthHydrated(): boolean {
  return useSyncExternalStore(subscribeToHydration, getHydrated, () => false);
}

function FullPageSkeleton() {
  return (
    <div className="flex min-h-screen" aria-busy="true">
      <Skeleton className="hidden h-screen w-64 rounded-none md:block" />
      <div className="flex flex-1 flex-col gap-4 p-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}

/** Wraps the authenticated app: unauthenticated visitors are sent to the login page. */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hydrated = useAuthHydrated();
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (hydrated && !accessToken) router.replace(Routes.auth.login);
  }, [hydrated, accessToken, router]);

  if (!hydrated || !accessToken) return <FullPageSkeleton />;
  return <>{children}</>;
}

/** Wraps login / signup: signed-in visitors are sent to the dashboard. */
export function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hydrated = useAuthHydrated();
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (hydrated && accessToken) router.replace(Routes.dashboard);
  }, [hydrated, accessToken, router]);

  if (!hydrated || accessToken) return <FullPageSkeleton />;
  return <>{children}</>;
}
