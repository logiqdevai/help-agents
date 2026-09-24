"use client";

import type { FC } from "react";
import { useWatch, type Control } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { AutomationRecipientFormOptions } from "@/config/constants/dropdowns/agents/automation-recipient-form.options";
import { WebhookIncludeFormOptions } from "@/config/constants/dropdowns/agents/webhook-include-form.options";
import type { Agent } from "@/features/agents/interfaces/agents.interfaces";
import {
  AutomationActionTypes,
  RecipientModes,
} from "@/features/automation-rules/interfaces/automation-rules.interfaces";
import type { AutomationRuleFormData } from "@/features/automation-rules/validation-schemas/automation-rules.schema";
import { useGetAgentOptions } from "@/features/team/hooks/use-team";
import { AutomationKeyValueRows } from "./automation-key-value-rows";

type TextFieldName =
  | "title"
  | "body"
  | "task_notes"
  | "due_in_days"
  | "reason"
  | "start_from"
  | "duration_minutes"
  | "attendee_email"
  | "recipient"
  | "subject"
  | "url";

interface ActionTextFieldProps {
  control: Control<AutomationRuleFormData>;
  index: number;
  name: TextFieldName;
  label: string;
  placeholder?: string;
  description?: string;
  multiline?: boolean;
  /** Id of a `<datalist>` offering suggestions. */
  listId?: string;
  className?: string;
}

const ActionTextField: FC<ActionTextFieldProps> = ({
  control,
  index,
  name,
  label,
  placeholder,
  description,
  multiline,
  listId,
  className,
}) => (
  <FormField
    control={control}
    name={`actions.${index}.${name}`}
    render={({ field }) => (
      <FormItem className={className}>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          {multiline ? (
            <Textarea className="min-h-20" placeholder={placeholder} {...field} />
          ) : (
            <Input placeholder={placeholder} autoComplete="off" list={listId} {...field} />
          )}
        </FormControl>
        {description ? <FormDescription>{description}</FormDescription> : null}
        <FormMessage />
      </FormItem>
    )}
  />
);

const PLACEHOLDER_HELP = "You can use {{call.summary}}, {{contact.name}} and {{gathered.<key>}}, filled in for each call.";

interface RecipientFieldsProps {
  control: Control<AutomationRuleFormData>;
  index: number;
  mode: typeof RecipientModes.CONTACT | typeof RecipientModes.CUSTOM;
  customLabel: string;
  customPlaceholder: string;
}

const RecipientFields: FC<RecipientFieldsProps> = ({ control, index, mode, customLabel, customPlaceholder }) => (
  <div className="grid gap-4 sm:grid-cols-2">
    <FormField
      control={control}
      name={`actions.${index}.recipient_mode`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Send to</FormLabel>
          <FormControl>
            <NativeSelect className="w-full" {...field}>
              {AutomationRecipientFormOptions.map((option) => (
                <NativeSelectOption key={option.id} value={option.id}>
                  {option.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </FormControl>
        </FormItem>
      )}
    />
    {mode === RecipientModes.CUSTOM ? (
      <ActionTextField
        control={control}
        index={index}
        name="recipient"
        label={customLabel}
        placeholder={customPlaceholder}
      />
    ) : null}
  </div>
);

const FollowUpAgentField: FC<{ control: Control<AutomationRuleFormData>; index: number }> = ({ control, index }) => {
  const agents = useGetAgentOptions();

  return (
    <FormField
      control={control}
      name={`actions.${index}.follow_up_agent_uuid`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Which agent calls</FormLabel>
          <FormControl>
            <NativeSelect className="w-full" {...field}>
              <NativeSelectOption value="">The agent that made the call</NativeSelectOption>
              {agents.data?.map((agent) => (
                <NativeSelectOption key={agent.id} value={agent.id}>
                  {agent.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </FormControl>
          <FormDescription>Only an active agent can place the follow-up call.</FormDescription>
        </FormItem>
      )}
    />
  );
};

interface AutomationActionFieldsProps {
  control: Control<AutomationRuleFormData>;
  /** Position of the action in the rule. */
  index: number;
  agent: Agent;
}

/** The settings that belong to the type of action chosen, e.g. the subject and message of an email. */
export const AutomationActionFields: FC<AutomationActionFieldsProps> = ({ control, index, agent }) => {
  const type = useWatch({ control, name: `actions.${index}.type` });
  const recipientMode = useWatch({ control, name: `actions.${index}.recipient_mode` });
  const startFromListId = `start-from-${index}`;

  switch (type) {
    case AutomationActionTypes.UPDATE_CRM:
      return (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            Set these fields on the contact in your CRM. Leave the list empty to save the result of the call as usual.
            Values can use {"{{call.outcome_label}}"} or {"{{gathered.<key>}}"}.
          </p>
          <AutomationKeyValueRows
            control={control}
            index={index}
            name="crm_fields"
            nameLabel="CRM field"
            valueLabel="Value"
            namePlaceholder="CRM field, e.g. status"
            valuePlaceholder="Value, e.g. Interested"
            addLabel="Add a field"
          />
        </div>
      );
    case AutomationActionTypes.ADD_CRM_NOTE:
      return (
        <ActionTextField
          control={control}
          index={index}
          name="body"
          label="Note"
          multiline
          description={PLACEHOLDER_HELP}
        />
      );
    case AutomationActionTypes.CREATE_CRM_TASK:
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <ActionTextField
            control={control}
            index={index}
            name="title"
            label="Task title"
            placeholder="Call {{contact.name}} back"
            className="sm:col-span-2"
          />
          <ActionTextField
            control={control}
            index={index}
            name="due_in_days"
            label="Due after (days)"
            placeholder="2"
            description="Leave empty for no due date."
          />
          <ActionTextField control={control} index={index} name="task_notes" label="Task notes" multiline />
        </div>
      );
    case AutomationActionTypes.SCHEDULE_FOLLOW_UP:
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <FollowUpAgentField control={control} index={index} />
          <ActionTextField
            control={control}
            index={index}
            name="reason"
            label="Reason (optional)"
            placeholder="Follow up on the earlier conversation"
          />
        </div>
      );
    case AutomationActionTypes.CANCEL_FOLLOW_UPS:
      return (
        <p className="text-sm text-muted-foreground">
          Cancels the calls still waiting to be made to this contact, so nobody is called again after they have made
          up their mind.
        </p>
      );
    case AutomationActionTypes.CREATE_CALENDAR_EVENT:
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <ActionTextField
            control={control}
            index={index}
            name="title"
            label="Event title"
            placeholder="Viewing with {{contact.name}}"
            className="sm:col-span-2"
          />
          <ActionTextField
            control={control}
            index={index}
            name="start_from"
            label="Starts at"
            placeholder="gathered.preferred_date"
            listId={startFromListId}
            description="Where the start time comes from: information the agent collected."
          />
          <datalist id={startFromListId}>
            {agent.goal_items.map((item) => (
              <option key={item.id} value={`gathered.${item.key}`} label={item.label} />
            ))}
          </datalist>
          <ActionTextField
            control={control}
            index={index}
            name="duration_minutes"
            label="Length (minutes)"
            placeholder="30"
          />
          <ActionTextField
            control={control}
            index={index}
            name="attendee_email"
            label="Invite (optional)"
            placeholder="Defaults to the contact's email"
            className="sm:col-span-2"
          />
        </div>
      );
    case AutomationActionTypes.SEND_EMAIL:
      return (
        <div className="flex flex-col gap-4">
          <RecipientFields
            control={control}
            index={index}
            mode={recipientMode}
            customLabel="Email address"
            customPlaceholder="team@example.com"
          />
          <ActionTextField control={control} index={index} name="subject" label="Subject" />
          <ActionTextField
            control={control}
            index={index}
            name="body"
            label="Message"
            multiline
            description={PLACEHOLDER_HELP}
          />
        </div>
      );
    case AutomationActionTypes.SEND_SMS:
      return (
        <div className="flex flex-col gap-4">
          <RecipientFields
            control={control}
            index={index}
            mode={recipientMode}
            customLabel="Phone number"
            customPlaceholder="+30 21 5550 1001"
          />
          <ActionTextField
            control={control}
            index={index}
            name="body"
            label="Message"
            multiline
            description={PLACEHOLDER_HELP}
          />
        </div>
      );
    default:
      return (
        <div className="flex flex-col gap-4">
          <ActionTextField
            control={control}
            index={index}
            name="url"
            label="Web address"
            placeholder="https://example.com/hooks/calls"
            description="The call details are sent here as JSON. Only secure (https) public addresses are allowed."
          />
          <FormField
            control={control}
            name={`actions.${index}.include`}
            render={({ field }) => (
              <FormItem>
                <fieldset className="flex flex-col gap-2.5">
                  <legend className="mb-1 text-sm font-medium">What to send</legend>
                  {WebhookIncludeFormOptions.map((option) => (
                    <div key={option.id} className="flex items-start gap-2">
                      <Checkbox
                        id={`webhook-${index}-${option.id}`}
                        className="mt-0.5"
                        checked={field.value.includes(option.id)}
                        onCheckedChange={(checked) =>
                          field.onChange(
                            checked ? [...field.value, option.id] : field.value.filter((key) => key !== option.id),
                          )
                        }
                      />
                      <label htmlFor={`webhook-${index}-${option.id}`} className="text-sm">
                        {option.label}
                        <span className="block text-muted-foreground">{option.description}</span>
                      </label>
                    </div>
                  ))}
                </fieldset>
              </FormItem>
            )}
          />
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Headers (optional)</p>
            <AutomationKeyValueRows
              control={control}
              index={index}
              name="headers"
              nameLabel="Header"
              valueLabel="Header value"
              namePlaceholder="Header, e.g. Authorization"
              valuePlaceholder="Value"
              addLabel="Add a header"
            />
          </div>
        </div>
      );
  }
};
