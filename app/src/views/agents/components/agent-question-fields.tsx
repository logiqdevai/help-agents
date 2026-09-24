"use client";

import type { FC } from "react";
import { useFieldArray, type UseFormReturn } from "react-hook-form";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { AgentBehaviorFormData } from "@/features/agents/validation-schemas/agents.schema";

interface AgentQuestionFieldsProps {
  /** Wrap the caller in `<Form {...form}>` so the field messages can find their form. */
  form: UseFormReturn<AgentBehaviorFormData>;
  disabled?: boolean;
}

/** Questions the agent works into the conversation, each with the answer you hope for. */
export const AgentQuestionFields: FC<AgentQuestionFieldsProps> = ({ form, disabled }) => {
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "questions" });

  return (
    <div className="flex flex-col gap-3">
      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground">No questions yet. The agent follows the instructions and goal.</p>
      ) : null}
      {fields.map((row, index) => (
        <div
          key={row.id}
          className="grid gap-2 sm:grid-cols-[1.5rem_minmax(0,1fr)_12rem_auto_auto] sm:items-start"
        >
          <span
            aria-hidden="true"
            className="hidden size-6 items-center justify-center rounded-full bg-secondary text-xs font-semibold sm:mt-1 sm:flex"
          >
            {index + 1}
          </span>
          <FormField
            control={form.control}
            name={`questions.${index}.question`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Question {index + 1}</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Are you still interested?" disabled={disabled} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`questions.${index}.expected_answer`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Answer you hope for to question {index + 1}</FormLabel>
                <FormControl>
                  <Input placeholder="Hoped-for answer (optional)" disabled={disabled} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`questions.${index}.is_required`}
            render={({ field }) => (
              <FormItem className="flex-row items-center gap-2 sm:h-8">
                <Switch
                  size="sm"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={disabled}
                  aria-label={`Question ${index + 1} must be answered`}
                />
                <span className="text-sm text-muted-foreground">Required</span>
              </FormItem>
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Remove question ${index + 1}`}
            disabled={disabled}
            onClick={() => remove(index)}
          >
            <Trash2Icon />
          </Button>
        </div>
      ))}
      {!disabled ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => append({ question: "", is_required: true, expected_answer: "" })}
        >
          <PlusIcon />
          Add question
        </Button>
      ) : null}
    </div>
  );
};
