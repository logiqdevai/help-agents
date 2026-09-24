"use client";

import { useState, type FC } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PhoneCallIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Permissions } from "@/config/constants/permissions";
import { AgentSetupSteps } from "@/features/agents/interfaces/agents.interfaces";
import { usePermissions } from "@/hooks/use-permissions";
import { AgentTestCalls } from "@/views/agents/components/agent-test-calls";
import { CallDialog, CallDialogVariants } from "@/views/calls/components/call-dialog";
import type { WizardStepProps } from "../types";
import { StepShell } from "./step-shell";
import { WizardFooter } from "./wizard-footer";

export const TestStep: FC<WizardStepProps> = ({ agent, onBack, onNext }) => {
  const { can } = usePermissions();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <StepShell step={AgentSetupSteps.TEST}>
        <div className="flex flex-col items-start gap-3">
          <Button onClick={() => setDialogOpen(true)} disabled={!can(Permissions.CALLS_PLACE)}>
            <PhoneCallIcon />
            Place a test call
          </Button>
          <p className="text-sm text-muted-foreground">
            The agent calls the number you enter right away. Test calls appear in Calls marked as tests and are billed
            like any other call.
          </p>
        </div>
        <AgentTestCalls agentId={agent.id} />
        <p className="text-sm text-muted-foreground">
          You can skip this step, but we recommend at least one test call before activating.
        </p>
      </StepShell>
      <WizardFooter onBack={onBack} onContinue={onNext} />
      <CallDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        variant={CallDialogVariants.TEST}
        agentId={agent.id}
        onPlaced={() => queryClient.invalidateQueries({ queryKey: ["agent"] })}
      />
    </>
  );
};
