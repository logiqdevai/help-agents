"use client";

import type { FC } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Skeleton } from "@/components/ui/skeleton";
import { InstructionVariableOptions } from "@/config/constants/dropdowns/agents/instruction-variable.options";
import type { Agent } from "@/features/agents/interfaces/agents.interfaces";
import { getPersonalizationVariables } from "@/features/agents/utils/instruction-variables.utils";
import type { AgentBehaviorFormData } from "@/features/agents/validation-schemas/agents.schema";
import { useGetFieldMappings } from "@/features/integrations/hooks/use-field-mappings";

interface InstructionVariableChipsProps {
  agent: Agent;
  form: UseFormReturn<AgentBehaviorFormData>;
}

/** Buttons that add a {{detail}} placeholder to the instructions; it is filled in before each call. */
export const InstructionVariableChips: FC<InstructionVariableChipsProps> = ({ agent, form }) => {
  const mappings = useGetFieldMappings(agent.crm_integration_uuid ?? "", agent.id);
  const crmVariables = mappings.data
    ? getPersonalizationVariables([...mappings.data.data, ...(mappings.data.inherited ?? [])])
    : [];
  const baseIds = InstructionVariableOptions.map((option) => option.id);
  const variables = [...baseIds, ...crmVariables.filter((key) => !baseIds.includes(key))];

  const insert = (key: string) => {
    const current = form.getValues("instructions");
    const separator = current && !/\s$/.test(current) ? " " : "";
    form.setValue("instructions", `${current}${separator}{{${key}}}`, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <div>
      <p className="mb-2 text-sm font-medium">Insert a detail</p>
      {agent.crm_integration_uuid && mappings.isPending ? (
        <Skeleton className="h-7 w-2/3" />
      ) : (
        <div className="flex flex-wrap gap-2">
          {variables.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => insert(key)}
              className="rounded-full border border-border bg-card px-3 py-1 font-mono text-xs transition-colors hover:border-hairline-strong focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              {`{{${key}}}`}
            </button>
          ))}
        </div>
      )}
      <p className="mt-2 text-sm text-muted-foreground">
        These are filled in before each call. Details from your CRM appear here once they are marked for
        personalization on the CRM tab.
      </p>
    </div>
  );
};
