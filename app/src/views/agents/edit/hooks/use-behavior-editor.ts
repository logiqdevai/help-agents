import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AgentEditTab } from "@/config/constants/dropdowns/agents/agent-edit-tab.options";
import { useSaveAgentBehavior } from "@/features/agents/hooks/use-agents";
import type { Agent } from "@/features/agents/interfaces/agents.interfaces";
import { toBehaviorFormValues, toSaveBehaviorInput } from "@/features/agents/utils/agent-payload.utils";
import { agentBehaviorSchema, type AgentBehaviorFormData } from "@/features/agents/validation-schemas/agents.schema";
import { notify } from "@/lib/notify";
import { EditSections, type SetSectionDirty } from "../types";
import { findTabWithErrors } from "../utils/behavior-tabs";
import { useReportDirty } from "./use-unsaved-changes";

/**
 * The behavior form spans three tabs (instructions, goals and questions, outcomes and transfer), so it
 * lives on the page and one save covers all of them.
 */
export function useBehaviorEditor(
  agent: Agent,
  setSectionDirty: SetSectionDirty,
  showTab: (tab: AgentEditTab) => void,
) {
  const saveBehavior = useSaveAgentBehavior();
  const form = useForm<AgentBehaviorFormData>({
    resolver: zodResolver(agentBehaviorSchema),
    defaultValues: toBehaviorFormValues(agent),
  });

  useReportDirty(EditSections.BEHAVIOR, form.formState.isDirty, setSectionDirty);

  const save = form.handleSubmit(
    (values) =>
      saveBehavior.mutate(toSaveBehaviorInput(agent.id, values), {
        // Rows created by this save now have ids; without them another save would replace instead of update.
        onSuccess: (saved) => form.reset(toBehaviorFormValues(saved)),
      }),
    (errors) => {
      const tab = findTabWithErrors(errors);
      if (tab) showTab(tab);
      notify.error("Some fields need attention", "Fix the highlighted fields, then save again.");
    },
  );

  return {
    form,
    isDirty: form.formState.isDirty,
    isPending: saveBehavior.isPending,
    save,
    discard: () => form.reset(toBehaviorFormValues(agent)),
  };
}

export type BehaviorEditor = ReturnType<typeof useBehaviorEditor>;
