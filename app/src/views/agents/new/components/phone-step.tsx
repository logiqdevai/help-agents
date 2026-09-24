"use client";

import type { FC } from "react";
import { PhoneForwardedIcon } from "lucide-react";
import { Permissions } from "@/config/constants/permissions";
import { AgentSetupSteps } from "@/features/agents/interfaces/agents.interfaces";
import { usePermissions } from "@/hooks/use-permissions";
import { PhoneNumberPicker } from "@/views/agents/components/phone-number-picker";
import type { WizardStepProps } from "../types";
import { StepShell } from "./step-shell";
import { WizardFooter } from "./wizard-footer";

export const PhoneStep: FC<WizardStepProps> = ({ agent, onBack, onNext }) => {
  const { can } = usePermissions();

  return (
    <>
      <StepShell step={AgentSetupSteps.PHONE}>
        <PhoneNumberPicker agentId={agent.id} canManage={can(Permissions.PHONE_NUMBERS_MANAGE)} />
        <div className="flex items-start gap-3 rounded-xl border border-border bg-muted px-4 py-3.5 text-sm">
          <PhoneForwardedIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <p>An agent needs an active phone number before it can be activated. You can change it later.</p>
        </div>
      </StepShell>
      <WizardFooter onBack={onBack} onContinue={onNext} />
    </>
  );
};
