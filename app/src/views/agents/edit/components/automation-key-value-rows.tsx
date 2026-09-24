"use client";

import type { FC } from "react";
import { useFieldArray, type Control } from "react-hook-form";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { AutomationRuleFormData } from "@/features/automation-rules/validation-schemas/automation-rules.schema";

interface AutomationKeyValueRowsProps {
  control: Control<AutomationRuleFormData>;
  /** Position of the action in the rule. */
  index: number;
  name: "crm_fields" | "headers";
  nameLabel: string;
  valueLabel: string;
  namePlaceholder: string;
  valuePlaceholder: string;
  addLabel: string;
}

/** A small list of name/value pairs, e.g. the CRM fields an action sets or the headers of a webhook. */
export const AutomationKeyValueRows: FC<AutomationKeyValueRowsProps> = ({
  control,
  index,
  name,
  nameLabel,
  valueLabel,
  namePlaceholder,
  valuePlaceholder,
  addLabel,
}) => {
  const { fields, append, remove } = useFieldArray({ control, name: `actions.${index}.${name}` });

  return (
    <div className="flex flex-col gap-3">
      {fields.map((row, rowIndex) => (
        <div key={row.id} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-start">
          <FormField
            control={control}
            name={`actions.${index}.${name}.${rowIndex}.name`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">
                  {nameLabel} {rowIndex + 1}
                </FormLabel>
                <FormControl>
                  <Input placeholder={namePlaceholder} autoComplete="off" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`actions.${index}.${name}.${rowIndex}.value`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">
                  {valueLabel} {rowIndex + 1}
                </FormLabel>
                <FormControl>
                  <Input placeholder={valuePlaceholder} autoComplete="off" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Remove ${nameLabel.toLowerCase()} ${rowIndex + 1}`}
            onClick={() => remove(rowIndex)}
          >
            <Trash2Icon aria-hidden="true" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => append({ name: "", value: "" })}
      >
        <PlusIcon aria-hidden="true" />
        {addLabel}
      </Button>
    </div>
  );
};
