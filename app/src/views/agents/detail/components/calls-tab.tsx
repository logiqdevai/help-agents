import type { FC } from "react";
import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Routes } from "@/routes/routes";
import { RecentCallsTable } from "./recent-calls-table";

const CALLS_LIMIT = 10;

export const CallsTab: FC<{ agentId: string }> = ({ agentId }) => (
  <div className="flex flex-col gap-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">The latest calls handled by this agent.</p>
      <Link href={Routes.calls.root} className={buttonVariants({ variant: "outline", size: "sm" })}>
        Open in Calls
        <ArrowUpRightIcon aria-hidden="true" />
      </Link>
    </div>
    <RecentCallsTable agentId={agentId} limit={CALLS_LIMIT} showPhone />
  </div>
);
