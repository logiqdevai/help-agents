import type { FC } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { KnowledgeConnectorOptions } from "@/config/constants/dropdowns/knowledge/knowledge-connector.options";
import { KnowledgeSourceTypeOptions } from "@/config/constants/dropdowns/knowledge/knowledge-source-type.options";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";
import { Routes } from "@/routes/routes";
import { cn } from "@/lib/utils";

/** Teaser for connected tools (Google Docs, Notion, ...) — not available yet, so purely informational. */
export const ConnectorsComingSoon: FC = () => (
  <section
    aria-label="Connected tools, coming soon"
    className="relative isolate overflow-hidden rounded-3xl border border-border bg-canvas-soft p-6 md:px-8 md:py-7"
  >
    <span
      aria-hidden="true"
      className="absolute -top-24 -right-10 -z-10 size-64 rounded-full bg-[radial-gradient(circle,var(--color-gradient-sky),transparent_68%)] opacity-80 blur-[48px]"
    />
    <span
      aria-hidden="true"
      className="absolute -bottom-32 right-44 -z-10 size-56 rounded-full bg-[radial-gradient(circle,var(--color-gradient-peach),transparent_68%)] opacity-80 blur-[48px]"
    />
    <div className="flex flex-wrap items-center justify-between gap-5">
      <div className="max-w-lg">
        <span className="inline-flex h-5 items-center rounded-full border border-border bg-background px-2 text-xs font-medium">
          Coming soon
        </span>
        <h3 className="mt-2.5 font-display text-2xl font-light tracking-tight">
          Connect the tools you already write in
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Soon your agents will be able to pull knowledge straight from your documents, so it stays up to date
          without uploading files.
        </p>
      </div>
      <div className="flex max-w-md flex-wrap items-center justify-end gap-2">
        {KnowledgeConnectorOptions.map((connector) => (
          <span
            key={connector.id}
            className="inline-flex h-8 items-center gap-2 rounded-full border border-border bg-background/80 px-3 text-sm"
          >
            <span aria-hidden="true" className="text-xs font-semibold text-muted-foreground">
              {connector.mark}
            </span>
            {getDropdownOptionLabel(KnowledgeSourceTypeOptions, connector.id)}
          </span>
        ))}
        <Link href={Routes.integrations.root} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          See integrations
        </Link>
      </div>
    </div>
  </section>
);
