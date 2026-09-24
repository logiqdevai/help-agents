import type { FC } from "react";
import Link from "next/link";
import {
  BuildingIcon,
  CalendarClockIcon,
  HeadphonesIcon,
  ReceiptTextIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TrendingUpIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";
import {
  AgentTemplateIds,
  AgentTemplateOptions,
  type AgentTemplateId,
} from "@/config/constants/dropdowns/agents/agent-template.options";
import { Routes } from "@/routes/routes";

const templateIcons: Record<AgentTemplateId, LucideIcon> = {
  [AgentTemplateIds.SALES_QUALIFICATION]: TrendingUpIcon,
  [AgentTemplateIds.SUPPORT_FOLLOW_UP]: HeadphonesIcon,
  [AgentTemplateIds.RECRUITMENT_AVAILABILITY]: UsersIcon,
  [AgentTemplateIds.APPOINTMENT_CONFIRMATION]: CalendarClockIcon,
  [AgentTemplateIds.INSURANCE_FOLLOW_UP]: ShieldCheckIcon,
  [AgentTemplateIds.LEAD_FOLLOW_UP]: BuildingIcon,
  [AgentTemplateIds.RESERVATION_CONFIRMATION]: ReceiptTextIcon,
};

interface TemplateCardProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  dashed?: boolean;
}

const TemplateCard: FC<TemplateCardProps> = ({ href, icon: Icon, title, description, dashed }) => (
  <Link
    href={href}
    className={
      dashed
        ? "flex items-start gap-3 rounded-xl border border-dashed border-hairline-strong p-4 transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
        : "flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors outline-none hover:border-hairline-strong focus-visible:ring-3 focus-visible:ring-ring/50"
    }
  >
    <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-secondary">
      <Icon className="size-[18px]" aria-hidden="true" />
    </span>
    <span className="min-w-0">
      <span className="block text-[15px] font-medium">{title}</span>
      <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">{description}</span>
    </span>
  </Link>
);

/** Starting points by use case; each opens the setup with the texts already written. */
export const AgentTemplates: FC = () => (
  <section aria-labelledby="agent-templates-heading" className="flex flex-col gap-4">
    <div>
      <h2 id="agent-templates-heading" className="font-display text-2xl font-light tracking-tight">
        Start from a use case
      </h2>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        The platform is not tied to one industry. Pick a starting point and adapt the instructions, goals and
        outcomes to your business.
      </p>
    </div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {AgentTemplateOptions.map((template) => (
        <TemplateCard
          key={template.id}
          href={Routes.agents.fromTemplate(template.id)}
          icon={templateIcons[template.id]}
          title={template.label}
          description={template.description}
        />
      ))}
      <TemplateCard
        href={Routes.agents.create}
        icon={SparklesIcon}
        title="Start from scratch"
        description="Describe the job in your own words."
        dashed
      />
    </div>
  </section>
);
