"use client";

import type { FC } from "react";
import { useFieldArray, useWatch, type Control, type UseFormReturn } from "react-hook-form";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { GoalDataTypeFormOptions } from "@/config/constants/dropdowns/agents/goal-data-type-form.options";
import { GoalRequirementFormOptions } from "@/config/constants/dropdowns/agents/goal-requirement-form.options";
import { GoalDataTypes } from "@/features/agents/interfaces/agents.interfaces";
import type { AgentBehaviorFormData } from "@/features/agents/validation-schemas/agents.schema";
import { newGoalItemRow } from "@/features/agents/utils/agent-payload.utils";

interface GoalItemRowProps {
  control: Control<AgentBehaviorFormData>;
  index: number;
  disabled?: boolean;
  onRemove: () => void;
}

const GoalItemRow: FC<GoalItemRowProps> = ({ control, index, disabled, onRemove }) => {
  const dataType = useWatch({ control, name: `goal_items.${index}.data_type` });

  return (
    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_10rem_auto] sm:items-start">
      <FormField
        control={control}
        name={`goal_items.${index}.label`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="sr-only">Item {index + 1}</FormLabel>
            <FormControl>
              <Input placeholder="e.g. Are they interested?" disabled={disabled} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`goal_items.${index}.data_type`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="sr-only">Answer type of item {index + 1}</FormLabel>
            <FormControl>
              <NativeSelect className="w-full" disabled={disabled} {...field}>
                {GoalDataTypeFormOptions.map((option) => (
                  <NativeSelectOption key={option.id} value={option.id}>
                    {option.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </FormControl>
          </FormItem>
        )}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Remove item ${index + 1}`}
        disabled={disabled}
        onClick={onRemove}
      >
        <Trash2Icon />
      </Button>
      {dataType === GoalDataTypes.ENUM ? (
        <FormField
          control={control}
          name={`goal_items.${index}.enum_values`}
          render={({ field }) => (
            <FormItem className="sm:col-span-3">
              <FormLabel className="sr-only">Choices for item {index + 1}</FormLabel>
              <FormControl>
                <Input placeholder="Choices, separated by commas: Morning, Afternoon, Evening" disabled={disabled} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : null}
    </div>
  );
};

interface AgentGoalFieldsProps {
  /** Wrap the caller in `<Form {...form}>` so the field messages can find their form. */
  form: UseFormReturn<AgentBehaviorFormData>;
  disabled?: boolean;
}

/** The goal in one line plus a checklist of what the agent must find out and what is nice to know. */
export const AgentGoalFields: FC<AgentGoalFieldsProps> = ({ form, disabled }) => {
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "goal_items" });

  return (
    <div className="flex flex-col gap-6">
      <FormField
        control={form.control}
        name="goal"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Goal</FormLabel>
            <FormControl>
              <Input placeholder="e.g. Determine customer interest" disabled={disabled} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {GoalRequirementFormOptions.map((group) => {
        const rows = fields.flatMap((field, index) => (field.requirement === group.id ? [index] : []));
        return (
          <div key={group.id} className="flex flex-col gap-3">
            <div>
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{group.label}</p>
              <p className="text-sm text-muted-foreground">{group.description}</p>
            </div>
            {rows.map((index) => (
              <GoalItemRow
                key={fields[index].id}
                control={form.control}
                index={index}
                disabled={disabled}
                onRemove={() => remove(index)}
              />
            ))}
            {!disabled ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="self-start"
                onClick={() => append(newGoalItemRow(group.id))}
              >
                <PlusIcon />
                Add item
              </Button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
