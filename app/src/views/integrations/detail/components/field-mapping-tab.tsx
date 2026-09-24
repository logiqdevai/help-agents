"use client";

import { useMemo, useState, type FC } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightIcon, InfoIcon, PlusIcon, SaveIcon, XIcon } from "lucide-react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CrmFieldDirectionFormOptions } from "@/config/constants/dropdowns/integrations/crm-field-direction-form.options";
import { CrmRecordTypeFormOptions } from "@/config/constants/dropdowns/integrations/crm-record-type-form.options";
import { CrmRecordTypes, type CrmRecordType } from "@/features/contacts/interfaces/contacts.interfaces";
import {
  useGetCrmFields,
  useGetFieldMappings,
  useGetInternalCrmFields,
  useReplaceFieldMappings,
} from "@/features/integrations/hooks/use-field-mappings";
import {
  GoalFieldPrefix,
  MappingDirections,
  type FieldMapping,
  type InternalField,
} from "@/features/integrations/interfaces/integrations.interfaces";
import { toFieldMappingInputs, toFieldMappingRow } from "@/features/integrations/utils/field-mapping-payload.utils";
import {
  fieldMappingsFormSchema,
  type FieldMappingsFormData,
} from "@/features/integrations/validation-schemas/field-mappings.schema";

interface FieldMappingTabProps {
  integrationId: string;
  integrationName: string;
  canManage: boolean;
  /** Edit this agent's own mapping, which overrides the connection's, instead of the connection's. */
  agentId?: string;
}

export const FieldMappingTab: FC<FieldMappingTabProps> = ({ integrationId, integrationName, canManage, agentId }) => {
  const mappings = useGetFieldMappings(integrationId, agentId);
  const internalFields = useGetInternalCrmFields();

  if (mappings.isPending || internalFields.isPending) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true">
        <Skeleton className="h-16 rounded-xl" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-full" />
        ))}
      </div>
    );
  }

  if (mappings.isError || internalFields.isError) {
    const failed = mappings.isError ? mappings : internalFields;
    return (
      <ErrorState
        title="Could not load the field mapping"
        message={failed.error?.message}
        onRetry={() => {
          void mappings.refetch();
          void internalFields.refetch();
        }}
      />
    );
  }

  // An agent without its own mapping starts from the connection's, so it only has to change what differs.
  const usesInherited = !!agentId && mappings.data.data.length === 0 && !!mappings.data.inherited?.length;
  const saved = usesInherited ? (mappings.data.inherited ?? []) : mappings.data.data;

  return (
    <FieldMappingForm
      // Rows get new ids on every save, so the form remounts with the saved values only after a save.
      key={`${usesInherited}-${saved.map((mapping) => mapping.id).join()}`}
      integrationId={integrationId}
      integrationName={integrationName}
      canManage={canManage}
      agentId={agentId}
      usesInherited={usesInherited}
      saved={saved}
      internalFields={internalFields.data.data}
    />
  );
};

interface FieldMappingFormProps extends FieldMappingTabProps {
  saved: FieldMapping[];
  /** The rows shown are the connection's; saving stores them as this agent's own. */
  usesInherited: boolean;
  internalFields: InternalField[];
}

const FieldMappingForm: FC<FieldMappingFormProps> = ({
  integrationId,
  integrationName,
  canManage,
  agentId,
  usesInherited,
  saved,
  internalFields,
}) => {
  const replaceMappings = useReplaceFieldMappings();
  const [recordType, setRecordType] = useState<CrmRecordType>(CrmRecordTypes.CONTACT);
  const crmFields = useGetCrmFields(integrationId, recordType);
  const datalistId = `crm-fields-${integrationId}`;
  const suggestOptions = useMemo(
    () =>
      CrmRecordTypeFormOptions.map((option) => ({
        id: option.id,
        label: `Suggest from ${option.label.toLowerCase()} fields`,
      })),
    [],
  );
  const internalFieldOptions = useMemo(
    () => [
      { id: "", label: "Choose a field", disabled: true },
      ...internalFields.map((internal) => ({ id: internal.key, label: internal.label })),
      { id: GoalFieldPrefix, label: "Information collected on the call…" },
    ],
    [internalFields],
  );

  const form = useForm<FieldMappingsFormData>({
    resolver: zodResolver(fieldMappingsFormSchema),
    defaultValues: { mappings: saved.map(toFieldMappingRow) },
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "mappings" });

  const submit = form.handleSubmit((values) =>
    replaceMappings
      .mutateAsync({ integrationId, dto: { agent_uuid: agentId, mappings: toFieldMappingInputs(values) } })
      .catch(() => undefined),
  );

  return (
    <Form {...form}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-6">
        <Card className="gap-0 py-0">
          <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 border-b border-border py-4">
            <div>
              <CardTitle className="text-base">Match fields between systems</CardTitle>
              <CardDescription className="mt-1">
                {agentId
                  ? usesInherited
                    ? `Showing the mapping of the ${integrationName} connection. Change it and save to give this agent its own.`
                    : "Saved for this agent only. It overrides the mapping of the connection."
                  : "Saved for this connection, so you only set it up once. An agent can override it in its own CRM settings."}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <SelectField<CrmRecordType>
                size="sm"
                aria-label="Suggest CRM fields from"
                value={recordType}
                onValueChange={setRecordType}
                options={suggestOptions}
              />
              {canManage ? (
                <ActionButtonWithPending type="submit" size="sm" variant="outline" isPending={replaceMappings.isPending}>
                  <SaveIcon />
                  Save mapping
                </ActionButtonWithPending>
              ) : null}
            </div>
          </CardHeader>

          {crmFields.isError ? (
            <p className="border-b border-border bg-muted px-4 py-2.5 text-sm text-muted-foreground sm:px-6">
              Could not read the fields of {integrationName}: {crmFields.error.message} You can still type field names
              by hand.
            </p>
          ) : null}

          <datalist id={datalistId}>
            {crmFields.data?.map((crmField) => (
              <option key={crmField.name} value={crmField.name}>
                {crmField.label}
              </option>
            ))}
          </datalist>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[220px]">Our field</TableHead>
                  <TableHead className="w-8" />
                  <TableHead className="min-w-[200px]">{integrationName} field</TableHead>
                  <TableHead className="min-w-[140px]">Direction</TableHead>
                  <TableHead className="text-right">Use to personalise calls</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.length ? (
                  fields.map((row, index) => (
                    <TableRow key={row.id}>
                      <TableCell className="align-top">
                        <FormField
                          control={form.control}
                          name={`mappings.${index}.internal_field`}
                          render={({ field }) => {
                            const isGoal = field.value.startsWith(GoalFieldPrefix);
                            return (
                              <FormItem className="gap-1.5">
                                <FormControl>
                                  <SelectField
                                    className="w-full"
                                    aria-label="Our field"
                                    disabled={!canManage}
                                    value={isGoal ? GoalFieldPrefix : field.value}
                                    onValueChange={field.onChange}
                                    onBlur={field.onBlur}
                                    ref={field.ref}
                                    options={internalFieldOptions}
                                  />
                                </FormControl>
                                {isGoal ? (
                                  <Input
                                    aria-label="Goal item key"
                                    placeholder="Goal item key, e.g. budget"
                                    disabled={!canManage}
                                    value={field.value.slice(GoalFieldPrefix.length)}
                                    onChange={(event) => field.onChange(`${GoalFieldPrefix}${event.target.value}`)}
                                  />
                                ) : null}
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        />
                      </TableCell>
                      <TableCell className="align-top text-muted-foreground">
                        <ArrowRightIcon className="mt-2 size-4" aria-hidden="true" />
                      </TableCell>
                      <TableCell className="align-top">
                        <FormField
                          control={form.control}
                          name={`mappings.${index}.external_field`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  list={datalistId}
                                  aria-label={`${integrationName} field`}
                                  placeholder="Field name in your CRM"
                                  autoComplete="off"
                                  disabled={!canManage}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell className="align-top">
                        <FormField
                          control={form.control}
                          name={`mappings.${index}.direction`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <SelectField
                                  className="w-full"
                                  aria-label="Direction"
                                  disabled={!canManage}
                                  name={field.name}
                                  value={field.value}
                                  onValueChange={field.onChange}
                                  onBlur={field.onBlur}
                                  ref={field.ref}
                                  options={CrmFieldDirectionFormOptions}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell className="text-right align-top">
                        <FormField
                          control={form.control}
                          name={`mappings.${index}.use_for_personalization`}
                          render={({ field }) => (
                            <FormItem className="items-end pt-1.5">
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!canManage}
                                aria-label="Use to personalise calls"
                              />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell className="align-top">
                        {canManage ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Remove mapping"
                            onClick={() => remove(index)}
                          >
                            <XIcon />
                          </Button>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      No fields matched yet. Add one to tell us where call results and customer details live in{" "}
                      {integrationName}.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <CardFooter className="flex-wrap justify-between gap-3">
            {canManage ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  append({
                    internal_field: "",
                    external_field: "",
                    direction: MappingDirections.BOTH,
                    use_for_personalization: false,
                  })
                }
              >
                <PlusIcon />
                Add field
              </Button>
            ) : (
              <span />
            )}
            <span className="text-sm text-muted-foreground">
              Fields marked for personalisation are handed to the agent before it calls.
            </span>
          </CardFooter>
        </Card>

        {agentId ? null : (
          <div className="flex items-start gap-3 rounded-xl border border-border bg-muted px-4 py-3.5 text-sm">
            <InfoIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <p className="text-body">
              <b className="font-medium text-foreground">Per connection or per agent.</b> This mapping applies to
              every agent using {integrationName} unless an agent has its own.
            </p>
          </div>
        )}
      </form>
    </Form>
  );
};
