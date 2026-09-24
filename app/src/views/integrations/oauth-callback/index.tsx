"use client";

import { useEffect, type FC } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { CheckIcon, CircleAlertIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getIntegrationOAuthErrorLabel } from "@/config/constants/dropdowns/integrations/integration-oauth-error.options";
import { getIntegrationProviderLabel } from "@/config/constants/dropdowns/integrations/integration-provider-form.options";
import { OAuthCallbackParams } from "@/features/integrations/interfaces/integrations.interfaces";
import { Routes } from "@/routes/routes";

const ForwardDelayMs = 1800;

const IntegrationOAuthCallbackPage: FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useSearchParams();

  const error = params.get(OAuthCallbackParams.ERROR);
  const connected = params.get(OAuthCallbackParams.CONNECTED);
  const integrationId = params.get(OAuthCallbackParams.INTEGRATION);
  const succeeded = !error && !!connected && !!integrationId;

  useEffect(() => {
    if (!succeeded) return;
    queryClient.invalidateQueries({ queryKey: ["integrations"] });
    queryClient.invalidateQueries({ queryKey: ["integration"] });
    const timer = window.setTimeout(() => router.replace(Routes.integrations.detail(integrationId)), ForwardDelayMs);
    return () => window.clearTimeout(timer);
  }, [succeeded, integrationId, queryClient, router]);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 pt-8">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 px-6 py-8 text-center">
          {succeeded ? (
            <>
              <span className="inline-flex size-12 items-center justify-center rounded-full bg-semantic-success/10 text-semantic-success">
                <CheckIcon className="size-6" aria-hidden="true" />
              </span>
              <div role="status">
                <h2 className="font-display text-3xl font-light tracking-tight">
                  {getIntegrationProviderLabel(connected.toUpperCase())} is connected
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Taking you to the connection so you can review its tools and field mapping.
                </p>
              </div>
              <Link href={Routes.integrations.detail(integrationId)} className={buttonVariants({ size: "lg" })}>
                Open connection
              </Link>
            </>
          ) : (
            <>
              <span className="inline-flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <CircleAlertIcon className="size-6" aria-hidden="true" />
              </span>
              <div role="alert">
                <h2 className="font-display text-3xl font-light tracking-tight">Connection not completed</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {getIntegrationOAuthErrorLabel(error ?? "")}
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <Link href={Routes.integrations.create} className={buttonVariants({ size: "lg" })}>
                  Try again
                </Link>
                <Link href={Routes.integrations.root} className={buttonVariants({ variant: "outline", size: "lg" })}>
                  Back to integrations
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationOAuthCallbackPage;
