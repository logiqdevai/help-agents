"use client";

import type { FC } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AgentBehaviorFormData } from "@/features/agents/validation-schemas/agents.schema";
import { ToggleLine } from "./toggle-line";

interface AgentTransferFieldsProps {
  /** Wrap the caller in `<Form {...form}>` so the field messages can find their form. */
  form: UseFormReturn<AgentBehaviorFormData>;
  disabled?: boolean;
}

/** When and where the agent hands a live call to a person, and what it says if nobody picks up. */
export const AgentTransferFields: FC<AgentTransferFieldsProps> = ({ form, disabled }) => {
  const transferEnabled = useWatch({ control: form.control, name: "transfer_enabled" });
  const outcomes = useWatch({ control: form.control, name: "outcomes" });

  return (
    <div className="flex flex-col gap-4">
      <FormField
        control={form.control}
        name="transfer_enabled"
        render={({ field }) => (
          <ToggleLine
            checked={field.value}
            onCheckedChange={field.onChange}
            disabled={disabled}
            label="Allow transfer to a team member"
            description="Hand a live call to a real person when needed."
          />
        )}
      />

      {transferEnabled ? (
        <div className="flex flex-col gap-5 sm:ml-11">
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-1 text-sm font-medium">Transfer this call to a real person when:</legend>
            <FormField
              control={form.control}
              name="transfer_on_request"
              render={({ field }) => (
                <FormItem className="flex-row items-center gap-2">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={disabled} />
                  </FormControl>
                  <FormLabel className="font-normal">The customer explicitly asks for a human</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="transfer_on_unresolved"
              render={({ field }) => (
                <FormItem className="flex-row items-center gap-2">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={disabled} />
                  </FormControl>
                  <FormLabel className="font-normal">The agent can&apos;t resolve the conversation</FormLabel>
                </FormItem>
              )}
            />
          </fieldset>

          <fieldset className="flex flex-col gap-3">
            <legend className="mb-1 text-sm font-medium">Or when the call ends with one of these outcomes:</legend>
            {outcomes.map((outcome, index) =>
              outcome.label.trim() ? (
                <FormField
                  key={outcome.id ?? outcome.key ?? index}
                  control={form.control}
                  name={`outcomes.${index}.triggers_transfer`}
                  render={({ field }) => (
                    <FormItem className="flex-row items-center gap-2">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={disabled} />
                      </FormControl>
                      <FormLabel className="font-normal">{outcome.label}</FormLabel>
                    </FormItem>
                  )}
                />
              ) : null,
            )}
          </fieldset>

          <FormField
            control={form.control}
            name="transfer_number"
            render={({ field }) => (
              <FormItem className="sm:max-w-xs">
                <FormLabel>Transfer to</FormLabel>
                <FormControl>
                  <Input type="tel" autoComplete="off" placeholder="+30 21 5550 1010" disabled={disabled} {...field} />
                </FormControl>
                <FormDescription>A phone number, with its country code.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="transfer_fallback_message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>If nobody is available</FormLabel>
                <FormControl>
                  <Textarea
                    className="min-h-20"
                    placeholder="Thanks for your patience. Nobody is free right now, so I've noted your details and a colleague will call you back."
                    disabled={disabled}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  The agent takes a message and logs a follow-up instead of leaving the customer stuck.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ) : null}
    </div>
  );
};
