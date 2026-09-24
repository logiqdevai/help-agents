import type { FC } from "react";
import Link from "next/link";
import { CheckIcon, CircleAlertIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  IntegrationStatuses,
  type Integration,
} from "@/features/integrations/interfaces/integrations.interfaces";
import { cn } from "@/lib/utils";
import { Routes } from "@/routes/routes";

/** Outcome of the automatic connection test that runs when a connection is saved. */
export const ConnectionResult: FC<{ integration: Integration }> = ({ integration }) => {
  const verified = integration.status === IntegrationStatuses.ACTIVE;
  const failed = integration.status === IntegrationStatuses.ERROR;

  return (
    <Card>
      <CardContent className="flex items-start gap-4 px-4 py-2 sm:px-5">
        <span
          className={cn(
            "inline-flex size-10 shrink-0 items-center justify-center rounded-full",
            failed ? "bg-destructive/10 text-destructive" : "bg-semantic-success/10 text-semantic-success",
          )}
        >
          {failed ? <CircleAlertIcon aria-hidden="true" /> : <CheckIcon aria-hidden="true" />}
        </span>
        <div className="min-w-0 flex-1" role="status">
          <h3 className="text-base font-medium">
            {failed ? "Saved, but the connection failed" : verified ? "Connection verified" : "Connection saved"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {failed ? (
              (integration.last_error ?? "The system did not accept the details.")
            ) : (
              <>
                {integration.name} is connected.
                {integration.credentials_hint ? (
                  <>
                    {" "}
                    Saved key shown as <span className="font-mono tracking-wider">{integration.credentials_hint}</span>.
                  </>
                ) : null}
              </>
            )}
          </p>
          <div className="mt-3">
            <Link
              href={Routes.integrations.detail(integration.id)}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              {failed ? "Fix connection" : "Define tools and field mapping"}
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
