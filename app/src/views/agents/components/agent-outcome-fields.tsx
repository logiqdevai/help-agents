"use client";

import type { FC } from "react";
import { useFieldArray, useWatch, type UseFormReturn } from "react-hook-form";
import { PlusIcon, Trash2Icon, VoicemailIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { AgentBehaviorFormData } from "@/features/agents/validation-schemas/agents.schema";

interface AgentOutcomeFieldsProps {
  /** Wrap the caller in `<Form {...form}>` so the field messages can find their form. */
  form: UseFormReturn<AgentBehaviorFormData>;
  disabled?: boolean;
}

/**
 * The outcomes a call can end with. The ones the platform recognises itself (voicemail, wrong number,
 * no answer, unknown) are kept in the list but cannot be renamed or removed.
 */
export const AgentOutcomeFields: FC<AgentOutcomeFieldsProps> = ({ form, disabled }) => {
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "outcomes" });
  const outcomes = useWatch({ control: form.control, name: "outcomes" });
  const automatic = outcomes.filter((outcome) => outcome.system_type);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {fields.map((row, index) =>
          row.system_type ? null : (
            <div key={row.id} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-start">
              <FormField
                control={form.control}
                name={`outcomes.${index}.label`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Outcome {index + 1}</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Interested" disabled={disabled} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`outcomes.${index}.is_success`}
                render={({ field }) => (
                  <FormItem className="flex-row items-center gap-2 sm:h-8">
                    <Switch
                      size="sm"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={disabled}
                      aria-label={`${outcomes[index]?.label || "Outcome"} counts as a success`}
                    />
                    <span className="text-sm text-muted-foreground">Success</span>
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove outcome ${index + 1}`}
                disabled={disabled}
                onClick={() => remove(index)}
              >
                <Trash2Icon />
              </Button>
            </div>
          ),
        )}
        {!disabled ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start"
            onClick={() => append({ label: "", is_success: false, system_type: null, triggers_transfer: false })}
          >
            <PlusIcon />
            Add outcome
          </Button>
        ) : null}
      </div>

      {automatic.length > 0 ? (
        <div className="flex items-start gap-3 rounded-xl border border-border bg-muted px-4 py-3.5 text-sm">
          <VoicemailIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div>
            <p>
              <b className="font-medium">Detected automatically.</b> These are recognised by the platform and logged
              as their own outcomes, so they are never mistaken for a real answer.
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {automatic.map((outcome) => (
                <li
                  key={outcome.system_type}
                  className="rounded-full border border-border bg-card px-2.5 py-0.5 text-xs"
                >
                  {outcome.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
};
