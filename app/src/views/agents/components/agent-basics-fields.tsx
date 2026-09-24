"use client";

import type { FC } from "react";
import type { UseFormReturn } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AgentBasicsFormData } from "@/features/agents/validation-schemas/agents.schema";

interface AgentBasicsFieldsProps {
  /** Wrap the caller in `<Form {...form}>` so the field messages can find their form. */
  form: UseFormReturn<AgentBasicsFormData>;
  disabled?: boolean;
}

/** Name, description and purpose: what the agent is called and what it is for. */
export const AgentBasicsFields: FC<AgentBasicsFieldsProps> = ({ form, disabled }) => (
  <div className="grid gap-5">
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Agent name</FormLabel>
          <FormControl>
            <Input autoComplete="off" placeholder="e.g. Lead Follow-up Agent" disabled={disabled} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Description</FormLabel>
          <FormControl>
            <Textarea
              className="min-h-20"
              placeholder="Follows up with new leads and finds out whether they are still interested."
              disabled={disabled}
              {...field}
            />
          </FormControl>
          <FormDescription>Shown to your team. Callers never see it.</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="purpose"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Purpose</FormLabel>
          <FormControl>
            <Input autoComplete="off" placeholder="Follow up with new leads" disabled={disabled} {...field} />
          </FormControl>
          <FormDescription>
            What is this agent for? For example &ldquo;Confirm appointments&rdquo;, &ldquo;Collect candidate
            availability&rdquo; or &ldquo;Follow up after a support request&rdquo;.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
);
