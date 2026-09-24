"use client";

import type { FC } from "react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PhoneForwardedIcon, SparklesIcon } from "lucide-react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { Button } from "@/components/ui/button";
import { ChoiceCardGroup } from "@/components/ui/choice-card-group";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { SelectField } from "@/components/ui/select-field";
import { PhoneCountryOptions } from "@/config/constants/dropdowns/phone-numbers/phone-country.options";
import { PhoneNumberSourceFormOptions } from "@/config/constants/dropdowns/phone-numbers/phone-number-source-form.options";
import { useGetAgentOptions } from "@/features/phone-numbers/hooks/use-agent-options";
import { useImportPhoneNumber, useProvisionPhoneNumber } from "@/features/phone-numbers/hooks/use-phone-numbers";
import {
  PhoneNumberSources,
  type PhoneNumberSource,
} from "@/features/phone-numbers/interfaces/phone-numbers.interfaces";
import {
  importPhoneNumberSchema,
  provisionPhoneNumberSchema,
  type ImportPhoneNumberFormData,
  type ProvisionPhoneNumberFormData,
} from "@/features/phone-numbers/validation-schemas/phone-numbers.schema";

const sourceIcon = {
  [PhoneNumberSources.PROVISIONED]: SparklesIcon,
  [PhoneNumberSources.BYO]: PhoneForwardedIcon,
};

/** Optional text fields come from empty inputs; the API expects them omitted instead. */
const orUndefined = (value: string) => value.trim() || undefined;

interface AddFormProps {
  onDone: () => void;
  /** Preselects the agent a new number is handed to. */
  defaultAgentId?: string;
}

const ProvisionForm: FC<AddFormProps> = ({ onDone, defaultAgentId }) => {
  const provision = useProvisionPhoneNumber();
  const agents = useGetAgentOptions();
  const agentSelectOptions = useMemo(
    () => [{ id: "", label: "Assign later" }, ...(agents.data ?? []).map((agent) => ({ id: agent.id, label: agent.name }))],
    [agents.data],
  );
  const form = useForm<ProvisionPhoneNumberFormData>({
    resolver: zodResolver(provisionPhoneNumberSchema),
    defaultValues: {
      country_code: PhoneCountryOptions[0].id,
      area_code: "",
      label: "",
      agent_uuid: defaultAgentId ?? "",
    },
  });

  const onSubmit = (values: ProvisionPhoneNumberFormData) =>
    provision.mutate(
      {
        dto: {
          country_code: values.country_code,
          area_code: orUndefined(values.area_code),
          label: orUndefined(values.label),
        },
        agent_uuid: orUndefined(values.agent_uuid),
      },
      { onSuccess: onDone },
    );

  return (
    <Form {...form}>
      <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="country_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <SelectField
                    className="w-full"
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    value={field.value}
                    onValueChange={field.onChange}
                    options={PhoneCountryOptions}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="area_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Area code <span className="font-normal text-muted-foreground">Optional</span>
                </FormLabel>
                <FormControl>
                  <Input inputMode="numeric" maxLength={3} placeholder="415" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="label"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>
                  Label <span className="font-normal text-muted-foreground">Optional</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Main outbound line" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="agent_uuid"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>
                  Assign to agent <span className="font-normal text-muted-foreground">Optional</span>
                </FormLabel>
                <FormControl>
                  <SelectField
                    className="w-full"
                    disabled={agents.isPending}
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    value={field.value}
                    onValueChange={field.onChange}
                    options={agentSelectOptions}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          We can get you a new number in the countries listed above. In any other country, bring your own number.
        </p>
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
          <ActionButtonWithPending type="submit" isPending={provision.isPending}>
            Get number
          </ActionButtonWithPending>
        </DialogFooter>
      </form>
    </Form>
  );
};

const ImportForm: FC<AddFormProps> = ({ onDone }) => {
  const importNumber = useImportPhoneNumber();
  const form = useForm<ImportPhoneNumberFormData>({
    resolver: zodResolver(importPhoneNumberSchema),
    defaultValues: { number: "", termination_uri: "", sip_username: "", sip_password: "", label: "" },
  });

  const onSubmit = (values: ImportPhoneNumberFormData) =>
    importNumber.mutate(
      {
        number: values.number.trim(),
        termination_uri: values.termination_uri,
        sip_username: orUndefined(values.sip_username),
        sip_password: orUndefined(values.sip_password),
        label: orUndefined(values.label),
      },
      { onSuccess: onDone },
    );

  return (
    <Form {...form}>
      <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone number</FormLabel>
                <FormControl>
                  <Input type="tel" autoComplete="off" placeholder="+30 21 5550 1234" {...field} />
                </FormControl>
                <p className="text-sm text-muted-foreground">Include the country code.</p>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="termination_uri"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Carrier trunk address</FormLabel>
                <FormControl>
                  <Input autoComplete="off" placeholder="mytrunk.carrier.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sip_username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Trunk username <span className="font-normal text-muted-foreground">Optional</span>
                </FormLabel>
                <FormControl>
                  <Input autoComplete="off" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sip_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Trunk password <span className="font-normal text-muted-foreground">Optional</span>
                </FormLabel>
                <FormControl>
                  <PasswordInput autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="label"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>
                  Label <span className="font-normal text-muted-foreground">Optional</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Sales inbound" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground" role="note">
          After you add it, we show the address to enter in your carrier&apos;s dashboard so calls to the number
          reach your agent.
        </p>
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
          <ActionButtonWithPending type="submit" isPending={importNumber.isPending}>
            Connect number
          </ActionButtonWithPending>
        </DialogFooter>
      </form>
    </Form>
  );
};

const AddPhoneNumberBody: FC<AddFormProps> = ({ onDone, defaultAgentId }) => {
  const [source, setSource] = useState<PhoneNumberSource>(PhoneNumberSources.PROVISIONED);

  return (
    <div className="flex flex-col gap-4">
      <ChoiceCardGroup
        name="phone-number-source"
        aria-label="How do you want to get a number?"
        value={source}
        onValueChange={setSource}
        options={PhoneNumberSourceFormOptions.map((option) => ({ ...option, icon: sourceIcon[option.id] }))}
      />
      {source === PhoneNumberSources.PROVISIONED ? (
        <ProvisionForm onDone={onDone} defaultAgentId={defaultAgentId} />
      ) : (
        <ImportForm onDone={onDone} />
      )}
    </div>
  );
};

interface AddPhoneNumberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Preselects the agent a new number is handed to, e.g. when adding a number from the agent setup. */
  defaultAgentId?: string;
}

export const AddPhoneNumberDialog: FC<AddPhoneNumberDialogProps> = ({ open, onOpenChange, defaultAgentId }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-xl">
      <DialogHeader>
        <DialogTitle className="text-lg">Add a phone number</DialogTitle>
        <DialogDescription>Choose how you want to get a number for an agent.</DialogDescription>
      </DialogHeader>
      <AddPhoneNumberBody onDone={() => onOpenChange(false)} defaultAgentId={defaultAgentId} />
    </DialogContent>
  </Dialog>
);
