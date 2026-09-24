"use client";

import type { FC } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, FileUpIcon, LockIcon, RotateCcwIcon, SaveIcon, TypeIcon } from "lucide-react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChoiceCardGroup } from "@/components/ui/choice-card-group";
import { EmptyState } from "@/components/ui/empty-state";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Textarea } from "@/components/ui/textarea";
import { KnowledgeAddModeDescriptions } from "@/config/constants/dropdowns/knowledge/knowledge-add-mode-description.options";
import { KnowledgeAddModeFormOptions } from "@/config/constants/dropdowns/knowledge/knowledge-add-mode-form.options";
import { KnowledgeConnectorOptions } from "@/config/constants/dropdowns/knowledge/knowledge-connector.options";
import { KnowledgeSourceTypeOptions } from "@/config/constants/dropdowns/knowledge/knowledge-source-type.options";
import { Permissions } from "@/config/constants/permissions";
import { useCreateKnowledge, useUploadKnowledge } from "@/features/knowledge/hooks/use-knowledge";
import { KnowledgeAddModes, type KnowledgeAddMode } from "@/features/knowledge/interfaces/knowledge.interfaces";
import {
  knowledgeFormSchema,
  type KnowledgeFormValues,
} from "@/features/knowledge/validation-schemas/knowledge.schema";
import { usePermissions } from "@/hooks/use-permissions";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";
import { Routes } from "@/routes/routes";
import { AgentPicker } from "../components/agent-picker";
import { FileDropzone } from "../components/file-dropzone";
import { SectionCard } from "../components/section-card";

const addModeIcon = {
  [KnowledgeAddModes.TEXT]: TypeIcon,
  [KnowledgeAddModes.FILE]: FileUpIcon,
};

const countWords = (text: string) => (text.trim() ? text.trim().split(/\s+/).length : 0);

const NewKnowledgePage: FC = () => {
  const router = useRouter();
  const { can } = usePermissions();
  const create = useCreateKnowledge();
  const upload = useUploadKnowledge();

  const form = useForm<KnowledgeFormValues>({
    resolver: zodResolver(knowledgeFormSchema),
    defaultValues: { mode: KnowledgeAddModes.TEXT, name: "", content: "", files: [], agent_uuids: [] },
  });
  const mode = useWatch({ control: form.control, name: "mode" });
  const content = useWatch({ control: form.control, name: "content" });
  const agentIds = useWatch({ control: form.control, name: "agent_uuids" });

  const backToList = { onSuccess: () => router.push(Routes.knowledge.root) };
  const onSubmit = (values: KnowledgeFormValues) => {
    if (values.mode === KnowledgeAddModes.TEXT) {
      create.mutate(
        { dto: { name: values.name, content: values.content }, agent_uuids: values.agent_uuids },
        backToList,
      );
    } else {
      upload.mutate({ files: values.files, agent_uuids: values.agent_uuids }, backToList);
    }
  };

  const changeMode = (next: KnowledgeAddMode) => {
    form.clearErrors();
    form.setValue("mode", next);
  };

  const header = (
    <div className="flex flex-col gap-3">
      <Link
        href={Routes.knowledge.root}
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" aria-hidden="true" />
        Knowledge
      </Link>
      <PageHeader
        title="Add knowledge"
        description="Give your agents the business information they need. It's processed automatically, then agents can look it up live while they talk to customers."
      />
    </div>
  );

  if (!can(Permissions.KNOWLEDGE_WRITE)) {
    return (
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
        {header}
        <EmptyState
          icon={LockIcon}
          title="You can't add knowledge"
          description="Your role can view knowledge but not change it. Ask an admin to add it for you."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      {header}
      <Form {...form}>
        <form
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]"
        >
          <div className="flex min-w-0 flex-col gap-6">
            <SectionCard title="1. How do you want to add it?" description="You can add more sources any time.">
              <div className="flex flex-col gap-5">
                <ChoiceCardGroup
                  name="knowledge-add-mode"
                  aria-label="How do you want to add knowledge?"
                  value={mode}
                  onValueChange={changeMode}
                  options={KnowledgeAddModeFormOptions.map((option) => ({
                    ...option,
                    description: KnowledgeAddModeDescriptions[option.id],
                    icon: addModeIcon[option.id],
                  }))}
                />
                <div className="flex items-center gap-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  <span className="h-px flex-1 bg-border" />
                  Connect a tool
                  <span className="h-px flex-1 bg-border" />
                </div>
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {KnowledgeConnectorOptions.map((connector) => (
                    <li
                      key={connector.id}
                      className="flex items-center gap-3 rounded-xl border border-border bg-canvas-soft px-4 py-3.5 opacity-80"
                    >
                      <span
                        aria-hidden="true"
                        className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-secondary text-xs font-semibold"
                      >
                        {connector.mark}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          {getDropdownOptionLabel(KnowledgeSourceTypeOptions, connector.id)}
                        </p>
                        <p className="text-xs text-muted-foreground">Coming soon</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-muted-foreground">
                  Connected tools will let agents pull knowledge straight from your documents. See{" "}
                  <Link href={Routes.integrations.root} className="text-foreground underline underline-offset-4">
                    Integrations
                  </Link>
                  .
                </p>
              </div>
            </SectionCard>

            {mode === KnowledgeAddModes.TEXT ? (
              <SectionCard
                title="2. Write your knowledge"
                description="Plain language works best. Short sections with clear headings are easiest for agents to use."
              >
                <div className="flex flex-col gap-5">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Pricing & Payment Policy" maxLength={200} {...field} />
                        </FormControl>
                        <p className="text-sm text-muted-foreground">
                          This is how the source appears in lists and on agents.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Content
                          <span className="font-normal text-muted-foreground">{countWords(content)} words</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            className="min-h-64"
                            placeholder="Paste or type your content here…"
                            {...field}
                          />
                        </FormControl>
                        <p className="text-sm text-muted-foreground">
                          Good things to add: company information, policies, FAQs, product or service details,
                          call scripts and guidance.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </SectionCard>
            ) : (
              <SectionCard title="2. Upload your files" description=".txt, .md, .doc and .docx · up to 10 MB each">
                <div className="flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="files"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FileDropzone
                          files={field.value}
                          onFilesChange={field.onChange}
                          invalid={!!fieldState.error}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground" role="note">
                    After you save, each file shows as <strong className="font-medium text-foreground">Processing</strong>{" "}
                    for a short while. You&apos;ll see{" "}
                    <strong className="font-medium text-foreground">Ready</strong> once agents can use it, and a clear
                    message if something goes wrong.
                  </p>
                </div>
              </SectionCard>
            )}
          </div>

          <div className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-6">
            <SectionCard
              flush
              title="3. Who can use it?"
              description="Pick the agents that should draw on this."
              footer={<span>{agentIds.length} {agentIds.length === 1 ? "agent" : "agents"} selected</span>}
            >
              <div className="px-5 md:px-6">
                <FormField
                  control={form.control}
                  name="agent_uuids"
                  render={({ field }) => <AgentPicker value={field.value} onChange={field.onChange} />}
                />
              </div>
            </SectionCard>

            <Card className="gap-4 p-5">
              <div className="flex gap-3 text-sm text-muted-foreground">
                <RotateCcwIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <p>
                  <strong className="font-medium text-foreground">Changes are versioned.</strong> When you edit this
                  later, the old version is kept, so you can always see what an agent knew during a past call.
                </p>
              </div>
              <ActionButtonWithPending
                type="submit"
                size="lg"
                className="w-full"
                isPending={create.isPending || upload.isPending}
              >
                <SaveIcon aria-hidden="true" />
                Save knowledge
              </ActionButtonWithPending>
              <Link href={Routes.knowledge.root} className={buttonVariants({ variant: "outline", size: "lg" })}>
                Cancel
              </Link>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default NewKnowledgePage;
