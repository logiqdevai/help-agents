"use client";

import type { FC } from "react";
import { PhoneForwardedIcon } from "lucide-react";
import { SectionCard } from "@/components/ui/section-card";
import { Permissions } from "@/config/constants/permissions";
import type { Agent } from "@/features/agents/interfaces/agents.interfaces";
import { usePermissions } from "@/hooks/use-permissions";
import { PhoneNumberPicker } from "@/views/agents/components/phone-number-picker";

export const PhoneTab: FC<{ agent: Agent }> = ({ agent }) => {
  const { can } = usePermissions();

  return (
    <div className="flex flex-col gap-6">
      <SectionCard
        title="Phone number"
        description="The number this agent calls from and receives calls on. Changes here are saved right away."
      >
        <PhoneNumberPicker agentId={agent.id} canManage={can(Permissions.PHONE_NUMBERS_MANAGE)} />
      </SectionCard>
      <div className="flex items-start gap-3 rounded-xl border border-border bg-muted px-4 py-3.5 text-sm">
        <PhoneForwardedIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <p>An agent needs an active phone number before it can be activated. Removing its number stops new calls.</p>
      </div>
    </div>
  );
};
