"use client";

import type { FC } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useCreateKnowledgeVersion } from "@/features/knowledge/hooks/use-knowledge";
import {
  KnowledgeAddModes,
  KnowledgeSourceTypes,
  type KnowledgeAddMode,
  type KnowledgeSourceDetail,
} from "@/features/knowledge/interfaces/knowledge.interfaces";
import {
  knowledgeVersionFormSchema,
  type KnowledgeVersionFormValues,
} from "@/features/knowledge/validation-schemas/knowledge.schema";
import { FileDropzone } from "../../components/file-dropzone";

interface EditContentFormProps {
  source: KnowledgeSourceDetail;
  onDone: () => void;
}

const EditContentForm: FC<EditContentFormProps> = ({ source, onDone }) => {
  const createVersion = useCreateKnowledgeVersion();
  const form = useForm<KnowledgeVersionFormValues>({
    resolver: zodResolver(knowledgeVersionFormSchema),
    defaultValues: { mode: KnowledgeAddModes.TEXT, content: source.content ?? "", file: null },
  });
  const mode = useWatch({ control: form.control, name: "mode" });
  const canUploadFile = source.type === KnowledgeSourceTypes.FILE;

  const onSubmit = (values: KnowledgeVersionFormValues) => {
    if (values.mode === KnowledgeAddModes.TEXT) {
      if (values.content.trim() === (source.content ?? "").trim()) {
        form.setError("content", { message: "Nothing has changed yet." });
        return;
      }
      createVersion.mutate({ id: source.id, dto: { content: values.content } }, { onSuccess: onDone });
    } else if (values.file) {
      createVersion.mutate({ id: source.id, dto: { file: values.file } }, { onSuccess: onDone });
    }
  };

  return (
    <Form {...form}>
      <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {canUploadFile ? (
          <Tabs
            value={mode}
            onValueChange={(next) => {
              form.clearErrors();
              form.setValue("mode", next as KnowledgeAddMode);
            }}
          >
            <TabsList>
              <TabsTrigger value={KnowledgeAddModes.TEXT}>Edit text</TabsTrigger>
              <TabsTrigger value={KnowledgeAddModes.FILE}>Upload a file</TabsTrigger>
            </TabsList>
          </Tabs>
        ) : null}

        {mode === KnowledgeAddModes.TEXT ? (
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Textarea className="max-h-[50vh] min-h-72 font-mono text-[13px] leading-7" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <FormField
            control={form.control}
            name="file"
            render={({ field, fieldState }) => (
              <FormItem>
                <FileDropzone
                  multiple={false}
                  files={field.value ? [field.value] : []}
                  onFilesChange={(files) => field.onChange(files[0] ?? null)}
                  invalid={!!fieldState.error}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
          <ActionButtonWithPending type="submit" isPending={createVersion.isPending}>
            Save as new version
          </ActionButtonWithPending>
        </DialogFooter>
      </form>
    </Form>
  );
};

interface EditContentDialogProps {
  source: KnowledgeSourceDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditContentDialog: FC<EditContentDialogProps> = ({ source, open, onOpenChange }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle className="text-lg">Edit content</DialogTitle>
        <DialogDescription>
          Saving creates version {source.current_version + 1}. Version {source.current_version} stays in the history.
        </DialogDescription>
      </DialogHeader>
      <EditContentForm source={source} onDone={() => onOpenChange(false)} />
    </DialogContent>
  </Dialog>
);
