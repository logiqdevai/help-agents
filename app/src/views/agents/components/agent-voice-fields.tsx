"use client";

import type { FC } from "react";
import type { UseFormReturn } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { getLanguageOptions } from "@/config/constants/dropdowns/shared/language.options";
import type { AgentBasicsFormData } from "@/features/agents/validation-schemas/agents.schema";
import { VoicePicker } from "./voice-picker";

interface AgentVoiceFieldsProps {
  /** Wrap the caller in `<Form {...form}>` so the field messages can find their form. */
  form: UseFormReturn<AgentBasicsFormData>;
  disabled?: boolean;
}

/** Language, voice and the first thing the agent says when the call is answered. */
export const AgentVoiceFields: FC<AgentVoiceFieldsProps> = ({ form, disabled }) => (
  <div className="grid gap-5">
    <FormField
      control={form.control}
      name="language"
      render={({ field }) => (
        <FormItem className="sm:max-w-xs">
          <FormLabel>Language</FormLabel>
          <FormControl>
            <NativeSelect className="w-full" disabled={disabled} {...field}>
              {getLanguageOptions(field.value).map((option) => (
                <NativeSelectOption key={option.id} value={option.id}>
                  {option.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    <FormField
      control={form.control}
      name="voice"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Voice</FormLabel>
          <VoicePicker value={field.value} onChange={field.onChange} disabled={disabled} />
          <FormDescription>If you do not choose one, we use a default voice.</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />

    <FormField
      control={form.control}
      name="first_message"
      render={({ field }) => (
        <FormItem>
          <FormLabel>First message</FormLabel>
          <FormControl>
            <Textarea
              className="min-h-20"
              placeholder="Hello {{customer_name}}, this is {{agent_name}} from {{company_name}}. Is now a good moment?"
              disabled={disabled}
              {...field}
            />
          </FormControl>
          <FormDescription>
            The first thing the agent says when the call is answered. Details in double braces, such as{" "}
            {"{{customer_name}}"}, are filled in for each call. Leave it empty to let the agent decide.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
);
