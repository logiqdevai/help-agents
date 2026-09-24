"use client";

import { useRef, useState, type FC } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftIcon, BotIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DetailSkeleton } from "@/components/ui/detail-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/ui/page-header";
import { getAgentTemplate } from "@/config/constants/dropdowns/agents/agent-template.options";
import { Permissions } from "@/config/constants/permissions";
import { useGetAgent, useGetAgentReadiness } from "@/features/agents/hooks/use-agents";
import {
  AgentSetupSteps,
  AgentStatuses,
  type Agent,
  type AgentSetupStep,
} from "@/features/agents/interfaces/agents.interfaces";
import { usePermissions } from "@/hooks/use-permissions";
import { formatRelative } from "@/lib/format";
import { Routes } from "@/routes/routes";
import { ActivateStep } from "./components/activate-step";
import { BasicsStep } from "./components/basics-step";
import { BehaviorStep } from "./components/behavior-step";
import { CrmStep } from "./components/crm-step";
import { KnowledgeStep } from "./components/knowledge-step";
import { PhoneStep } from "./components/phone-step";
import { TestStep } from "./components/test-step";
import { WizardStepper } from "./components/wizard-stepper";
import { buildWizardUrl, WizardParams } from "./utils/wizard-url";
import { getResumeStep, getWizardStepIndex, isWizardStep, WizardStepOrder } from "./utils/wizard-steps";

interface WizardProps {
  initialAgentId: string | null;
  initialStep: AgentSetupStep;
  /** The furthest step already reached, so a resumed draft can jump between the steps it has done. */
  initialFurthest: number;
  templateId: string | null;
}

/** The seven-step setup. The draft is created on the first save and every later step saves to it. */
const Wizard: FC<WizardProps> = ({ initialAgentId, initialStep, initialFurthest, templateId }) => {
  const router = useRouter();
  const topRef = useRef<HTMLDivElement>(null);
  const [agentId, setAgentId] = useState(initialAgentId);
  const [step, setStep] = useState(initialStep);
  const [furthest, setFurthest] = useState(initialFurthest);
  const agentQuery = useGetAgent(agentId ?? "");
  const agent = agentQuery.data;
  const template = getAgentTemplate(templateId);

  // Keeps the URL in step with the wizard so a refresh, or the link on the agents list, reopens the same place.
  const goTo = (next: AgentSetupStep, id: string | null = agentId) => {
    setStep(next);
    setFurthest((current) => Math.max(current, getWizardStepIndex(next)));
    router.replace(buildWizardUrl({ agentId: id, step: next, templateId }), { scroll: false });
    topRef.current?.scrollIntoView({ block: "start" });
  };

  const goToOffset = (offset: number) => goTo(WizardStepOrder[getWizardStepIndex(step) + offset]);

  const handleBasicsSaved = (saved: Agent, advance: boolean) => {
    setAgentId(saved.id);
    goTo(advance ? AgentSetupSteps.BEHAVIOR : AgentSetupSteps.BASICS, saved.id);
  };

  const stepProps = { onBack: () => goToOffset(-1), onNext: () => goToOffset(1) };

  const renderStep = () => {
    if (step === AgentSetupSteps.BASICS) {
      return <BasicsStep agent={agent} template={template} onSaved={handleBasicsSaved} />;
    }
    if (agentQuery.isError) {
      return (
        <div className="px-5 py-8 sm:px-8">
          <ErrorState
            title="Could not load the draft"
            message={agentQuery.error.message}
            onRetry={() => agentQuery.refetch()}
          />
        </div>
      );
    }
    if (!agent) return <DetailSkeleton cards={2} withTable={false} />;

    switch (step) {
      case AgentSetupSteps.BEHAVIOR:
        return <BehaviorStep agent={agent} template={template} {...stepProps} />;
      case AgentSetupSteps.KNOWLEDGE:
        return <KnowledgeStep agent={agent} {...stepProps} />;
      case AgentSetupSteps.CRM:
        return <CrmStep agent={agent} {...stepProps} />;
      case AgentSetupSteps.PHONE:
        return <PhoneStep agent={agent} {...stepProps} />;
      case AgentSetupSteps.TEST:
        return <TestStep agent={agent} {...stepProps} />;
      default:
        return <ActivateStep agent={agent} {...stepProps} />;
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <div ref={topRef} className="flex scroll-mt-4 flex-col gap-3">
        <Link
          href={Routes.agents.root}
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" aria-hidden="true" />
          All agents
        </Link>
        <PageHeader
          title="Create an agent"
          description="Seven short steps from an idea to a live agent. Your progress is saved as a draft along the way."
          actions={
            <Badge variant="outline">
              {agent
                ? `${agent.status === AgentStatuses.DRAFT ? "Draft · saved" : "Saved"} ${formatRelative(agent.updated_at)}`
                : "Not saved yet"}
            </Badge>
          }
        />
      </div>

      <Card className="gap-0 py-0">
        <div className="border-b border-border px-4 py-3 sm:px-6">
          <WizardStepper
            current={step}
            furthest={furthest}
            onSelect={(next) => goTo(next)}
          />
        </div>
        {/* Keyed by step so each step starts with fresh form state. */}
        <div key={step}>{renderStep()}</div>
      </Card>
    </div>
  );
};

/** Loads the draft being resumed (if any) and works out which step to reopen it on. */
const NewAgentPage: FC = () => {
  const { can } = usePermissions();
  const params = useSearchParams();
  // Read once: the wizard rewrites the URL as it goes, which must not restart it.
  const [{ agentId, stepParam, templateId }] = useState(() => ({
    agentId: params.get(WizardParams.AGENT),
    stepParam: params.get(WizardParams.STEP),
    templateId: params.get(WizardParams.TEMPLATE),
  }));

  const agent = useGetAgent(agentId ?? "");
  const readiness = useGetAgentReadiness(agentId ?? "");

  if (!can(Permissions.AGENTS_WRITE)) {
    return (
      <div className="mx-auto w-full max-w-[1200px]">
        <EmptyState
          icon={BotIcon}
          title="You cannot create agents"
          description="Ask an owner or admin of your company to give you access."
        />
      </div>
    );
  }

  if (!agentId) {
    return <Wizard initialAgentId={null} initialStep={AgentSetupSteps.BASICS} initialFurthest={0} templateId={templateId} />;
  }

  if (agent.isPending || readiness.isPending) {
    return (
      <div className="mx-auto w-full max-w-[1200px]">
        <DetailSkeleton cards={2} withTable={false} />
      </div>
    );
  }

  if (agent.isError || readiness.isError) {
    const failed = agent.isError ? agent : readiness;
    return (
      <div className="mx-auto w-full max-w-[1200px]">
        <ErrorState
          title="Could not open this draft"
          message={failed.error?.message}
          onRetry={() => {
            void agent.refetch();
            void readiness.refetch();
          }}
        />
      </div>
    );
  }

  const resumeStep = getResumeStep(readiness.data);
  const initialStep = isWizardStep(stepParam) ? stepParam : resumeStep;

  return (
    <Wizard
      initialAgentId={agentId}
      initialStep={initialStep}
      initialFurthest={Math.max(getWizardStepIndex(initialStep), getWizardStepIndex(resumeStep))}
      templateId={templateId}
    />
  );
};

export default NewAgentPage;
