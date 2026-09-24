"use client";

import type { FC } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RocketIcon } from "lucide-react";
import { ErrorState } from "@/components/ui/error-state";
import { SectionCard } from "@/components/ui/section-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useActivateAgent,
  useGetAgentOverview,
} from "@/features/agents/hooks/use-agents";
import {
  AgentSetupSteps,
  AgentStatuses,
  GoalRequirements,
  type Agent,
  type AgentOverview,
} from "@/features/agents/interfaces/agents.interfaces";
import { useGetCallingHours } from "@/features/company/hooks/use-company";
import { formatNumber } from "@/lib/format";
import { Routes } from "@/routes/routes";
import { summarizeCallingHours } from "@/views/calls/utils/calling-hours";
import { AgentReadinessList } from "@/views/agents/components/agent-readiness-list";
import { AgentVoiceText } from "@/views/agents/components/agent-voice-text";
import { getAgentSetupDetails } from "@/views/agents/utils/agent-setup-details";
import type { WizardStepProps } from "../types";
import { StepShell } from "./step-shell";
import { WizardFooter } from "./wizard-footer";

const pluralize = (count: number, noun: string) => `${formatNumber(count)} ${noun}${count === 1 ? "" : "s"}`;

const SummaryRow: FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="grid gap-1 py-3 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4">
    <dt className="text-sm text-muted-foreground">{label}</dt>
    <dd className="min-w-0 text-sm">{children}</dd>
  </div>
);

const Summary: FC<{ agent: Agent; overview: AgentOverview }> = ({ agent, overview }) => {
  const mustCount = agent.goal_items.filter((item) => item.requirement === GoalRequirements.REQUIRED).length;
  const niceCount = agent.goal_items.length - mustCount;
  const automaticCount = agent.outcomes.filter((outcome) => outcome.system_type).length;
  const numbers = overview.phone_numbers.map((phone) => phone.number).join(", ");

  return (
    <dl className="divide-y divide-border">
      <SummaryRow label="Name">
        <b className="font-medium">{agent.name}</b>
      </SummaryRow>
      <SummaryRow label="Purpose">{agent.purpose || <span className="text-muted-foreground">Not set</span>}</SummaryRow>
      <SummaryRow label="Voice">
        <AgentVoiceText voiceId={agent.voice} detailed />
      </SummaryRow>
      <SummaryRow label="Goal">
        {agent.goal || "No goal written"} · {mustCount} must, {niceCount} nice to know
      </SummaryRow>
      <SummaryRow label="Questions">{formatNumber(agent.questions.length)}</SummaryRow>
      <SummaryRow label="Outcomes">
        {agent.outcomes.length - automaticCount} defined + {automaticCount} detected automatically
      </SummaryRow>
      <SummaryRow label="Human transfer">
        {agent.transfer_enabled ? `On · ${agent.transfer_number ?? "no number"}` : "Off"}
      </SummaryRow>
      <SummaryRow label="Knowledge">{pluralize(agent.knowledge_sources.length, "source")}</SummaryRow>
      <SummaryRow label="CRM">
        {agent.crm_integration
          ? `${agent.crm_integration.name} · ${pluralize(agent.crm_tools.length, "action")} allowed`
          : "No CRM"}
      </SummaryRow>
      <SummaryRow label="Phone">
        {numbers ? <span className="tabular-nums">{numbers}</span> : <span className="text-muted-foreground">None yet</span>}
      </SummaryRow>
    </dl>
  );
};

export const ActivateStep: FC<WizardStepProps> = ({ agent, onBack }) => {
  const router = useRouter();
  const overview = useGetAgentOverview(agent.id);
  const callingHours = useGetCallingHours();
  const activate = useActivateAgent();
  const isLive = agent.status === AgentStatuses.ACTIVE;

  const activateAgent = () =>
    activate.mutate(agent.id, { onSuccess: () => router.push(Routes.agents.detail(agent.id)) });

  if (overview.isPending) {
    return (
      <div className="flex max-w-3xl flex-col gap-4 px-5 py-8 sm:px-8 sm:py-10" aria-busy="true">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  if (overview.isError) {
    return (
      <div className="px-5 py-8 sm:px-8">
        <ErrorState
          title="Could not check the agent"
          message={overview.error.message}
          onRetry={() => overview.refetch()}
        />
      </div>
    );
  }

  const { readiness } = overview.data;

  return (
    <>
      <StepShell step={AgentSetupSteps.ACTIVATE}>
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <SectionCard title="Summary" contentClassName="px-6 py-1">
            <Summary agent={agent} overview={overview.data} />
          </SectionCard>
          <div className="flex flex-col gap-6">
            <SectionCard
              title="Calling hours"
              actions={
                <Link href={Routes.settings.organization} className="text-sm underline underline-offset-4">
                  Change
                </Link>
              }
              footer="Automated calls are never placed outside these hours."
            >
              {callingHours.isPending ? (
                <Skeleton className="h-16 w-full" />
              ) : callingHours.isError ? (
                <ErrorState
                  title="Could not load the calling hours"
                  message={callingHours.error.message}
                  onRetry={() => callingHours.refetch()}
                />
              ) : (
                <ul className="flex flex-col gap-1 text-sm">
                  {summarizeCallingHours(callingHours.data).map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                  <li className="text-muted-foreground">Timezone: {callingHours.data.timezone}</li>
                </ul>
              )}
            </SectionCard>
            <SectionCard title={isLive ? "This agent is live" : "Ready to go live"}>
              <AgentReadinessList
                readiness={readiness}
                details={getAgentSetupDetails(agent, overview.data)}
                hideActivation
              />
            </SectionCard>
          </div>
        </div>
      </StepShell>
      <WizardFooter
        onBack={onBack}
        onContinue={isLive ? () => router.push(Routes.agents.detail(agent.id)) : activateAgent}
        continueLabel={isLive ? "Open the agent" : "Activate agent"}
        continueIcon={<RocketIcon />}
        isPending={activate.isPending}
        disabled={!isLive && !readiness.is_ready}
      />
    </>
  );
};
