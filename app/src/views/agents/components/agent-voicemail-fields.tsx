"use client";

import type { FC } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import type { AgentBehaviorFormData } from "@/features/agents/validation-schemas/agents.schema";
import { ToggleLine } from "./toggle-line";

interface AgentVoicemailFieldsProps {
  /** Wrap the caller in `<Form {...form}>` so the field messages can find their form. */
  form: UseFormReturn<AgentBehaviorFormData>;
  disabled?: boolean;
}

/** Whether to recognise answering machines and whether to leave a pre-approved message on them. */
export const AgentVoicemailFields: FC<AgentVoicemailFieldsProps> = ({ form, disabled }) => {
  const leaveVoicemail = useWatch({ control: form.control, name: "leave_voicemail" });

  return (
    <div className="flex flex-col gap-4">
      <FormField
        control={form.control}
        name="detect_voicemail"
        render={({ field }) => (
          <ToggleLine
            checked={field.value}
            onCheckedChange={field.onChange}
            disabled={disabled}
            label="Detect voicemail"
            description="Recognise answering machines and log them as their own outcome."
          />
        )}
      />
      <FormField
        control={form.control}
        name="leave_voicemail"
        render={({ field }) => (
          <ToggleLine
            checked={field.value}
            onCheckedChange={field.onChange}
            disabled={disabled}
            label="Leave a short message"
            description="Say a pre-approved message before hanging up."
          />
        )}
      />
      {leaveVoicemail ? (
        <FormField
          control={form.control}
          name="voicemail_message"
          render={({ field }) => (
            <FormItem className="sm:ml-11">
              <FormLabel>Voicemail message</FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-20"
                  placeholder="Hello, this is {{company_name}} calling about your recent enquiry. We'll try you again soon. Thank you."
                  disabled={disabled}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : null}
    </div>
  );
};
