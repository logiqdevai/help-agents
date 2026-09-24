"use client";

import { useMemo, type FC } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BotIcon, BuildingIcon } from "lucide-react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { Button } from "@/components/ui/button";
import { ChoiceCardGroup } from "@/components/ui/choice-card-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { AutomationActionTypeFormOptions } from "@/config/constants/dropdowns/agents/automation-action-type-form.options";
import { AutomationScopeFormOptions } from "@/config/constants/dropdowns/agents/automation-scope-form.options";
import { AutomationTriggerFormOptions } from "@/config/constants/dropdowns/agents/automation-trigger-form.options";
import type { Agent } from "@/features/agents/interfaces/agents.interfaces";
import { useCreateAutomationRule, useUpdateAutomationRule } from "@/features/automation-rules/hooks/use-automation-rules";
import {
  AutomationTriggers,
  RuleScopes,
  type AutomationActionType,
  type AutomationRule,
  type RuleScope,
} from "@/features/automation-rules/interfaces/automation-rules.interfaces";
import { newActionRow, toRuleDto, toRuleFormValues } from "@/features/automation-rules/utils/automation-rule-payload.utils";
import {
  automationRuleSchema,
  type AutomationRuleFormData,
} from "@/features/automation-rules/validation-schemas/automation-rules.schema";
import { AutomationActionEditor } from "./automation-action-editor";

const scopeIcons = { [RuleScopes.AGENT]: BotIcon, [RuleScopes.COMPANY]: BuildingIcon };

const addActionOptions = [
  { id: "", label: "Add an action…", disabled: true },
  ...AutomationActionTypeFormOptions.map((option): { id: string; label: string; disabled?: boolean } => option),
];

interface AutomationRuleDialogProps {
  agent: Agent;
  /** The rule being edited, or null to create a new one for this agent. */
  rule: AutomationRule | null;
  onClose: () => void;
}

export const AutomationRuleDialog: FC<AutomationRuleDialogProps> = ({ agent, rule, onClose }) => {
  const createRule = useCreateAutomationRule();
  const updateRule = useUpdateAutomationRule();
  const isPending = createRule.isPending || updateRule.isPending;

  const form = useForm<AutomationRuleFormData>({
    resolver: zodResolver(automationRuleSchema),
    defaultValues: toRuleFormValues(rule ?? undefined, RuleScopes.AGENT),
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "actions" });
  const trigger = useWatch({ control: form.control, name: "trigger" });
  const scope = useWatch({ control: form.control, name: "scope" });
  const actionsError = form.formState.errors.actions?.root?.message ?? form.formState.errors.actions?.message;
  const outcomeOptions = useMemo(
    () => [{ id: "", label: "Any outcome" }, ...agent.outcomes.map((outcome) => ({ id: outcome.id, label: outcome.label }))],
    [agent.outcomes],
  );

  const onSubmit = (values: AutomationRuleFormData) => {
    const dto = toRuleDto(values, agent.id);
    if (rule) updateRule.mutate({ id: rule.id, dto }, { onSuccess: onClose });
    else createRule.mutate(dto, { onSuccess: onClose });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{rule ? "Edit automation rule" : "New automation rule"}</DialogTitle>
          <DialogDescription>When this happens, do that.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex flex-col gap-6" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rule name</FormLabel>
                  <FormControl>
                    <Input placeholder="Interested: follow up in 2 days" autoComplete="off" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="trigger"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>When</FormLabel>
                    <FormControl>
                      <SelectField
                        className="w-full"
                        name={field.name}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        value={field.value}
                        onValueChange={field.onChange}
                        options={AutomationTriggerFormOptions}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              {trigger === AutomationTriggers.CALL_OUTCOME && scope === RuleScopes.AGENT ? (
                <FormField
                  control={form.control}
                  name="outcome_uuid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Outcome</FormLabel>
                      <FormControl>
                        <SelectField
                          className="w-full"
                          name={field.name}
                          ref={field.ref}
                          onBlur={field.onBlur}
                          value={field.value}
                          onValueChange={field.onChange}
                          options={outcomeOptions}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ) : null}
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium">Then do</p>
              {fields.length > 0 ? (
                <ul className="flex flex-col gap-3">
                  {fields.map((row, index) => (
                    <AutomationActionEditor
                      key={row.id}
                      control={form.control}
                      index={index}
                      agent={agent}
                      onRemove={() => remove(index)}
                    />
                  ))}
                </ul>
              ) : null}
              <SelectField
                size="sm"
                aria-label="Add an action"
                value=""
                onValueChange={(next) => next && append(newActionRow(next as AutomationActionType))}
                options={addActionOptions}
              />
              {actionsError ? (
                <p role="alert" className="text-sm text-destructive">
                  {actionsError}
                </p>
              ) : null}
            </div>

            <FormField
              control={form.control}
              name="scope"
              render={({ field }) => (
                <FormItem>
                  <span className="text-sm font-medium">Applies to</span>
                  <ChoiceCardGroup<RuleScope>
                    name="automation-rule-scope"
                    aria-label="Applies to"
                    value={field.value}
                    onValueChange={field.onChange}
                    options={AutomationScopeFormOptions.map((option) => ({ ...option, icon: scopeIcons[option.id] }))}
                  />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" disabled={isPending} onClick={onClose}>
                Cancel
              </Button>
              <ActionButtonWithPending type="submit" isPending={isPending}>
                Save rule
              </ActionButtonWithPending>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
