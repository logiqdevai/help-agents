import type { FC } from "react";
import { CheckIcon } from "lucide-react";
import { AgentSetupStepOptions } from "@/config/constants/dropdowns/agents/agent-setup-step.options";
import type { AgentSetupStep } from "@/features/agents/interfaces/agents.interfaces";
import { cn } from "@/lib/utils";
import { getWizardStepIndex } from "../utils/wizard-steps";

interface WizardStepperProps {
  current: AgentSetupStep;
  /** The furthest step reached so far; later steps stay locked. */
  furthest: number;
  onSelect: (step: AgentSetupStep) => void;
}

/** The seven steps in a row; the ones already reached can be revisited. */
export const WizardStepper: FC<WizardStepperProps> = ({ current, furthest, onSelect }) => {
  const currentIndex = getWizardStepIndex(current);

  return (
    <nav aria-label="Setup steps" className="-mx-1 overflow-x-auto px-1">
      <ol className="flex min-w-max gap-1.5">
        {AgentSetupStepOptions.map((step, index) => {
          const isCurrent = index === currentIndex;
          const isDone = index <= furthest && !isCurrent;
          return (
            <li key={step.id}>
              <button
                type="button"
                disabled={index > furthest}
                aria-current={isCurrent ? "step" : undefined}
                onClick={() => onSelect(step.id)}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-full px-3 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
                  isCurrent ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full text-xs",
                    isCurrent ? "bg-primary-foreground/20" : "bg-secondary",
                  )}
                >
                  {isDone ? <CheckIcon className="size-3" /> : index + 1}
                </span>
                {step.label}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
