"use client";

import type { FC } from "react";
import { useWatch, type Control } from "react-hook-form";
import { Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { AutomationActionTypeFormOptions } from "@/config/constants/dropdowns/agents/automation-action-type-form.options";
import { AutomationDelayUnitFormOptions } from "@/config/constants/dropdowns/agents/automation-delay-unit-form.options";
import type { Agent } from "@/features/agents/interfaces/agents.interfaces";
import { AutomationActionTypes } from "@/features/automation-rules/interfaces/automation-rules.interfaces";
import type { AutomationRuleFormData } from "@/features/automation-rules/validation-schemas/automation-rules.schema";
import { AutomationActionIcons } from "../utils/automation-action-icons";
import { AutomationActionFields } from "./automation-action-fields";

interface AutomationActionEditorProps {
  control: Control<AutomationRuleFormData>;
  /** Position of the action in the rule. */
  index: number;
  agent: Agent;
  onRemove: () => void;
}

/** One "then do" step: what to do, how long to wait, and the settings of that kind of action. */
export const AutomationActionEditor: FC<AutomationActionEditorProps> = ({ control, index, agent, onRemove }) => {
  const type = useWatch({ control, name: `actions.${index}.type` });
  const Icon = AutomationActionIcons[type];
  const isFollowUp = type === AutomationActionTypes.SCHEDULE_FOLLOW_UP;

  return (
    <li className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary"
        >
          <Icon className="size-4" />
        </span>
        <FormField
          control={control}
          name={`actions.${index}.type`}
          render={({ field }) => (
            <FormItem className="min-w-0 flex-1">
              <FormLabel className="sr-only">Action {index + 1}</FormLabel>
              <FormControl>
                <NativeSelect className="w-full" {...field}>
                  {AutomationActionTypeFormOptions.map((option) => (
                    <NativeSelectOption key={option.id} value={option.id}>
                      {option.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="button" variant="ghost" size="icon" aria-label={`Remove action ${index + 1}`} onClick={onRemove}>
          <Trash2Icon aria-hidden="true" />
        </Button>
      </div>

      <FormField
        control={control}
        name={`actions.${index}.delay_value`}
        render={({ field }) => (
          <FormItem>
            <div className="flex flex-wrap items-center gap-2">
              <FormLabel>{isFollowUp ? "Call again after" : "Do this after"}</FormLabel>
              <FormControl>
                <Input inputMode="numeric" className="w-20" {...field} />
              </FormControl>
              <FormField
                control={control}
                name={`actions.${index}.delay_unit`}
                render={({ field: unitField }) => (
                  <FormItem>
                    <FormControl>
                      <NativeSelect aria-label="Unit of time" {...unitField}>
                        {AutomationDelayUnitFormOptions.map((option) => (
                          <NativeSelectOption key={option.id} value={option.id}>
                            {option.label}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <FormDescription>{isFollowUp ? "0 books the call for the next allowed time." : "0 runs it right away."}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <AutomationActionFields control={control} index={index} agent={agent} />
    </li>
  );
};
