import type { FC, ReactNode } from "react";
import { AgentSetupStepOptions } from "@/config/constants/dropdowns/agents/agent-setup-step.options";
import type { AgentSetupStep } from "@/features/agents/interfaces/agents.interfaces";

interface StepShellProps {
  step: AgentSetupStep;
  children: ReactNode;
}

/** The heading of a step (title and lede come from the step definitions) above its content. */
export const StepShell: FC<StepShellProps> = ({ step, children }) => {
  const definition = AgentSetupStepOptions.find((option) => option.id === step);

  return (
    <div className="flex max-w-3xl flex-col gap-8 px-5 py-8 sm:px-8 sm:py-10">
      <div>
        <h2 className="font-display text-3xl font-light tracking-tight">{definition?.title}</h2>
        <p className="mt-1.5 max-w-xl text-muted-foreground">{definition?.description}</p>
      </div>
      {children}
    </div>
  );
};
