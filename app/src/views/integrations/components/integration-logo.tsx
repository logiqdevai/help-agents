import type { FC } from "react";
import {
  CloudIcon,
  DatabaseIcon,
  FileTextIcon,
  FolderIcon,
  HardDriveIcon,
  MailIcon,
  NotebookPenIcon,
  PuzzleIcon,
  TerminalIcon,
  CalendarIcon,
  type LucideIcon,
} from "lucide-react";
import {
  CustomProviders,
  IntegrationProviders,
  type IntegrationProvider,
} from "@/features/integrations/interfaces/integrations.interfaces";
import { cn } from "@/lib/utils";

// Logo marks: brand apps get a two-letter monogram, everything else a neutral glyph.
const Monograms: Partial<Record<IntegrationProvider, string>> = {
  [IntegrationProviders.HUBSPOT]: "Hu",
  [IntegrationProviders.SALESFORCE]: "Sf",
  [IntegrationProviders.PIPEDRIVE]: "Pd",
  [IntegrationProviders.ZOHO]: "Zo",
  [IntegrationProviders.SLACK]: "Sl",
};

const Glyphs: Partial<Record<IntegrationProvider, LucideIcon>> = {
  [IntegrationProviders.CUSTOM_CRM]: DatabaseIcon,
  [IntegrationProviders.GENERIC_API]: TerminalIcon,
  [IntegrationProviders.GOOGLE_DOCS]: FileTextIcon,
  [IntegrationProviders.GOOGLE_DRIVE]: HardDriveIcon,
  [IntegrationProviders.GOOGLE_CALENDAR]: CalendarIcon,
  [IntegrationProviders.GMAIL]: MailIcon,
  [IntegrationProviders.NOTION]: NotebookPenIcon,
  [IntegrationProviders.DROPBOX]: FolderIcon,
  [IntegrationProviders.SHAREPOINT]: CloudIcon,
  [IntegrationProviders.OTHER]: PuzzleIcon,
};

interface IntegrationLogoProps {
  provider: IntegrationProvider;
  /** Connections to a customer's own system show the first letters of their name instead of a glyph. */
  name?: string;
  size?: "md" | "lg";
  className?: string;
}

export const IntegrationLogo: FC<IntegrationLogoProps> = ({ provider, name, size = "md", className }) => {
  const Glyph = Glyphs[provider];
  const monogram = Monograms[provider] ?? (name && CustomProviders.includes(provider) ? name.slice(0, 2) : undefined);
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center bg-secondary font-medium text-foreground",
        size === "lg" ? "size-12 rounded-xl text-base" : "size-10 rounded-[10px] text-[15px]",
        className,
      )}
    >
      {monogram ? monogram : Glyph ? <Glyph className={size === "lg" ? "size-5" : "size-[18px]"} /> : null}
    </span>
  );
};
