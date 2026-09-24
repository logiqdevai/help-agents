"use client";

import { useEffect, type FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { HttpMethodFormOptions } from "@/config/constants/dropdowns/integrations/http-method-form.options";
import { useCreateCrmTool, useUpdateCrmTool } from "@/features/integrations/hooks/use-crm-tools";
import type { CrmTool } from "@/features/integrations/interfaces/integrations.interfaces";
import {
  toCreateCrmToolDto,
  toCrmToolFormValues,
  toUpdateCrmToolDto,
} from "@/features/integrations/utils/crm-tool-payload.utils";
import { crmToolFormSchema, type CrmToolFormData } from "@/features/integrations/validation-schemas/crm-tools.schema";

interface CrmToolDialogProps {
  integrationId: string;
  /** The tool being edited; omit to add a new one. */
  tool?: CrmTool;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CrmToolDialog: FC<CrmToolDialogProps> = ({ integrationId, tool, open, onOpenChange }) => {
  const createTool = useCreateCrmTool();
  const updateTool = useUpdateCrmTool();
  const isPending = createTool.isPending || updateTool.isPending;
  const form = useForm<CrmToolFormData>({
    resolver: zodResolver(crmToolFormSchema),
    defaultValues: toCrmToolFormValues(tool),
  });

  useEffect(() => {
    if (open) form.reset(toCrmToolFormValues(tool));
  }, [open, tool, form]);

  const submit = form.handleSubmit(async (values) => {
    const saved = tool
      ? await updateTool
          .mutateAsync({ integrationId, toolId: tool.id, dto: toUpdateCrmToolDto(values) })
          .catch(() => null)
      : await createTool.mutateAsync({ integrationId, dto: toCreateCrmToolDto(values) }).catch(() => null);
    if (saved) onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{tool ? `Edit ${tool.name}` : "Add a tool"}</DialogTitle>
          <DialogDescription>
            A tool is an action an agent can request from this system. It is called with the details the AI provides
            for the input schema below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Add a note to a customer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key</FormLabel>
                    <FormControl>
                      <Input className="font-mono" placeholder="add_customer_note" disabled={!!tool} {...field} />
                    </FormControl>
                    <FormDescription>
                      {tool ? "The key cannot be changed." : "Stable identifier in snake_case."}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>
                      Description <span className="font-normal text-muted-foreground">Optional</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea rows={2} placeholder="Explains to the AI when to use this tool" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Category <span className="font-normal text-muted-foreground">Optional</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="notes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="justify-end">
                    <div className="flex h-8 items-center gap-2">
                      <Switch checked={field.value} onCheckedChange={field.onChange} id="tool-active" />
                      <label htmlFor="tool-active" className="text-sm">
                        Available to agents
                      </label>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Method</FormLabel>
                    <FormControl>
                      <SelectField
                        className="w-full"
                        name={field.name}
                        value={field.value}
                        onValueChange={field.onChange}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        options={HttpMethodFormOptions}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="path"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Path</FormLabel>
                    <FormControl>
                      <Input className="font-mono" placeholder="/contacts/{contact_id}/notes" {...field} />
                    </FormControl>
                    <FormDescription>
                      Relative to the base URL. <span className="font-mono">{"{placeholders}"}</span> are filled from the
                      tool input.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Query parameters <span className="font-normal text-muted-foreground">Optional JSON</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea className="font-mono text-xs" rows={4} placeholder='{ "limit": "{limit}" }' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Request body <span className="font-normal text-muted-foreground">Optional JSON</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea className="font-mono text-xs" rows={4} placeholder='{ "note": "{note}" }' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="input_schema"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Input schema</FormLabel>
                  <FormControl>
                    <Textarea className="font-mono text-xs" rows={8} spellCheck={false} {...field} />
                  </FormControl>
                  <FormDescription>
                    JSON schema of the details the AI must provide, for example properties and required fields.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <ActionButtonWithPending type="submit" isPending={isPending}>
                {tool ? "Save tool" : "Add tool"}
              </ActionButtonWithPending>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
