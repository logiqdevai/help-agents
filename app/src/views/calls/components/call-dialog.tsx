"use client";

import { useState, type FC } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetCallAgentOptions, usePlaceCall, usePlaceTestCall } from "@/features/calls/hooks/use-calls";
import type { CallListItem, PlaceCallDto } from "@/features/calls/interfaces/calls.interfaces";
import {
  placeCallSchema,
  testCallSchema,
  type CallFormData,
} from "@/features/calls/validation-schemas/calls.schema";
import { Routes } from "@/routes/routes";
import { ContactPicker, type PickedContact } from "./contact-picker";

export const CallDialogVariants = {
  TEST: "test",
  LIVE: "live",
} as const;
export type CallDialogVariant = (typeof CallDialogVariants)[keyof typeof CallDialogVariants];

interface CallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: CallDialogVariant;
  /** Fixes the agent (and hides the agent picker), e.g. when testing the agent being viewed or set up. */
  agentId?: string;
  /** Called with the new call instead of opening its detail page. */
  onPlaced?: (call: CallListItem) => void;
}

const toDto = (values: CallFormData): PlaceCallDto => ({
  agent_uuid: values.agent_uuid,
  contact_uuid: values.contact_uuid || undefined,
  name: values.name || undefined,
  phone: values.phone || undefined,
});

interface AgentFieldProps {
  control: Control<CallFormData>;
  /** Live calls need an active agent; a test call is how you try an agent before activating it. */
  activeOnly: boolean;
}

const AgentField: FC<AgentFieldProps> = ({ control, activeOnly }) => {
  const agents = useGetCallAgentOptions(activeOnly);

  return (
    <FormField
      control={control}
      name="agent_uuid"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Agent</FormLabel>
          {agents.isPending ? (
            <Skeleton className="h-8 w-full" />
          ) : agents.isError ? (
            <div className="flex items-center justify-between gap-2 text-sm text-destructive">
              <span>{agents.error.message}</span>
              <Button type="button" variant="outline" size="sm" onClick={() => agents.refetch()}>
                Try again
              </Button>
            </div>
          ) : agents.data.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              You have no active agents yet.{" "}
              <Link href={Routes.agents.root} className="text-foreground underline underline-offset-4">
                Go to Agents
              </Link>
            </p>
          ) : (
            <FormControl>
              <NativeSelect className="w-full" {...field}>
                <NativeSelectOption value="">Choose an agent</NativeSelectOption>
                {agents.data.map((agent) => (
                  <NativeSelectOption key={agent.id} value={agent.id}>
                    {agent.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </FormControl>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const CallDialogForm: FC<Omit<CallDialogProps, "open">> = ({ onOpenChange, variant, agentId, onPlaced }) => {
  const router = useRouter();
  const isTest = variant === CallDialogVariants.TEST;
  const placeTestCall = usePlaceTestCall();
  const placeCall = usePlaceCall();
  const mutation = isTest ? placeTestCall : placeCall;
  const [contact, setContact] = useState<PickedContact | null>(null);

  const form = useForm<CallFormData>({
    resolver: zodResolver(isTest ? testCallSchema : placeCallSchema),
    defaultValues: { agent_uuid: agentId ?? "", contact_uuid: "", name: "", phone: "" },
  });

  const handleContactChange = (next: PickedContact | null) => {
    setContact(next);
    form.setValue("contact_uuid", next?.id ?? "");
    if (next) {
      form.setValue("name", next.name ?? "", { shouldValidate: form.formState.isSubmitted });
      form.setValue("phone", next.phone ?? "", { shouldValidate: form.formState.isSubmitted });
    }
  };

  const onSubmit = (values: CallFormData) =>
    mutation.mutate(toDto(values), {
      onSuccess: (call) => {
        onOpenChange(false);
        if (onPlaced) onPlaced(call);
        else router.push(Routes.calls.detail(call.id));
      },
    });

  return (
    <Form {...form}>
      <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        {agentId ? null : <AgentField control={form.control} activeOnly={!isTest} />}

        <div className="grid gap-2">
          <Label htmlFor="call-contact">
            CRM contact <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <ContactPicker id="call-contact" value={contact} onChange={handleContactChange} />
          <p className="text-sm text-muted-foreground">
            {isTest
              ? "Link a CRM record so the agent is personalized with its details."
              : "Pick someone from your CRM, or type a number below."}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{isTest ? "Your name" : "Name"}</FormLabel>
                <FormControl>
                  <Input autoComplete="off" placeholder="Maria Papadopoulou" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{isTest ? "Phone to ring" : "Phone number"}</FormLabel>
                <FormControl>
                  <Input type="tel" autoComplete="off" placeholder="+30 697 555 0114" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <p className="-mt-2 text-sm text-muted-foreground">
          {isTest
            ? "Test calls ring this number right away, ignore calling hours and are marked as test calls."
            : "Calls are only placed within your company's calling hours."}
        </p>

        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" disabled={mutation.isPending} />}>
            Cancel
          </DialogClose>
          <ActionButtonWithPending type="submit" isPending={mutation.isPending}>
            {isTest ? "Start test call" : "Place call"}
          </ActionButtonWithPending>
        </DialogFooter>
      </form>
    </Form>
  );
};

/** "Test call" and "Place call" share one form: pick an agent, then who to ring. */
export const CallDialog: FC<CallDialogProps> = ({ open, onOpenChange, variant, agentId, onPlaced }) => {
  const isTest = variant === CallDialogVariants.TEST;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isTest ? "Test call" : "Place a call"}</DialogTitle>
          <DialogDescription>
            {isTest
              ? "Hear how an agent sounds: it will call the number you enter."
              : "Have an agent call someone now."}
          </DialogDescription>
        </DialogHeader>
        <CallDialogForm onOpenChange={onOpenChange} variant={variant} agentId={agentId} onPlaced={onPlaced} />
      </DialogContent>
    </Dialog>
  );
};
