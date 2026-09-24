"use client";

import type { FC } from "react";
import type { UseFormReturn } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AgentBehaviorFormData } from "@/features/agents/validation-schemas/agents.schema";

interface AgentSuccessFieldsProps {
  /** Wrap the caller in `<Form {...form}>` so the field messages can find their form. */
  form: UseFormReturn<AgentBehaviorFormData>;
  disabled?: boolean;
}

/** What counts as a successful and an unsuccessful call, and how long a call may last. */
export const AgentSuccessFields: FC<AgentSuccessFieldsProps> = ({ form, disabled }) => (
  <div className="grid gap-5 sm:grid-cols-2">
    <FormField
      control={form.control}
      name="success_criteria"
      render={({ field }) => (
        <FormItem>
          <FormLabel>What counts as a successful call?</FormLabel>
          <FormControl>
            <Textarea
              className="min-h-20"
              placeholder="Customer confirms they are still interested."
              disabled={disabled}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="failure_criteria"
      render={({ field }) => (
        <FormItem>
          <FormLabel>What counts as an unsuccessful call?</FormLabel>
          <FormControl>
            <Textarea
              className="min-h-20"
              placeholder="Customer declines, or the call ends without a clear answer."
              disabled={disabled}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="max_call_minutes"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Maximum call length</FormLabel>
          <div className="flex items-center gap-2">
            <FormControl>
              <Input
                inputMode="numeric"
                className="w-24"
                placeholder="6"
                disabled={disabled}
                {...field}
              />
            </FormControl>
            <span className="text-sm text-muted-foreground">minutes</span>
          </div>
          <FormDescription>The agent wraps up politely before this limit. Leave empty for the default.</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
);
