"use client";

import type { FC } from "react";
import type { UseFormReturn } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import type { AgentBehaviorFormData } from "@/features/agents/validation-schemas/agents.schema";
import { formatNumber } from "@/lib/format";

const MAX_INSTRUCTIONS_LENGTH = 50000;

interface AgentInstructionsFieldProps {
  /** Wrap the caller in `<Form {...form}>` so the field messages can find their form. */
  form: UseFormReturn<AgentBehaviorFormData>;
  disabled?: boolean;
}

/** The plain-language briefing that tells the agent how to behave on a call. */
export const AgentInstructionsField: FC<AgentInstructionsFieldProps> = ({ form, disabled }) => (
  <FormField
    control={form.control}
    name="instructions"
    render={({ field }) => (
      <FormItem>
        <FormLabel className="sr-only">Instructions</FormLabel>
        <FormControl>
          <Textarea
            className="min-h-64 leading-relaxed"
            placeholder={
              "You are a customer follow-up assistant.\n\nYour goal is to find out whether the customer is still interested. Be polite and concise.\n\nNever make up information you don't have."
            }
            disabled={disabled}
            {...field}
          />
        </FormControl>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <FormDescription>
            Write it the way you would brief a new colleague. We take care of the technical side.
          </FormDescription>
          <span className="text-sm text-muted-foreground tabular-nums">
            {formatNumber(field.value.length)} / {formatNumber(MAX_INSTRUCTIONS_LENGTH)}
          </span>
        </div>
        <FormMessage />
      </FormItem>
    )}
  />
);
