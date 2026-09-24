import type { FC } from "react";
import { CircleCheckIcon, CircleIcon, TriangleAlertIcon } from "lucide-react";
import { AgentSetupStepOptions } from "@/config/constants/dropdowns/agents/agent-setup-step.options";
import { AgentSetupSteps, type AgentReadiness, type AgentSetupStep } from "@/features/agents/interfaces/agents.interfaces";
import { cn } from "@/lib/utils";

interface AgentReadinessListProps {
  readiness: AgentReadiness;
  /** A line under each step, e.g. "3 sources ready to use". */
  details?: Partial<Record<AgentSetupStep, string>>;
  /** Hide the "Activated" step, e.g. on the review screen where activating is the action itself. */
  hideActivation?: boolean;
  className?: string;
}

/** The setup steps with a tick when they are done, followed by whatever still blocks going live. */
export const AgentReadinessList: FC<AgentReadinessListProps> = ({ readiness, details, hideActivation, className }) => {
  const steps = AgentSetupStepOptions.filter((step) => !hideActivation || step.id !== AgentSetupSteps.ACTIVATE);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <ul className="flex flex-col gap-3">
        {steps.map((step) => {
          const state = readiness.steps[step.id];
          const Icon = state.complete ? CircleCheckIcon : CircleIcon;
          return (
            <li key={step.id} className="flex items-start gap-2.5 text-sm">
              <Icon
                className={cn("mt-0.5 size-4 shrink-0", state.complete ? "text-semantic-success" : "text-muted-foreground")}
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className={cn("font-medium", !state.complete && "text-muted-foreground")}>
                  {step.label}
                  <span className="sr-only">{state.complete ? " (done)" : " (not done yet)"}</span>
                  {!state.complete && state.optional ? (
                    <span className="ml-2 text-xs font-normal">Recommended</span>
                  ) : null}
                </p>
                {details?.[step.id] ? <p className="text-muted-foreground">{details[step.id]}</p> : null}
              </div>
            </li>
          );
        })}
      </ul>

      {readiness.blockers.length > 0 ? (
        <div role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm">
          <p className="mb-1.5 flex items-center gap-2 font-medium text-destructive">
            <TriangleAlertIcon className="size-4" aria-hidden="true" />
            Before this agent can go live
          </p>
          <ul className="list-disc space-y-1 pl-6 text-muted-foreground">
            {readiness.blockers.map((blocker) => (
              <li key={blocker.code}>{blocker.message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {readiness.warnings.length > 0 ? (
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {readiness.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};
