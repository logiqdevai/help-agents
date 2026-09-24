"use client";

import { useId, type FC } from "react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { getCrmToolCategoryLabel } from "@/config/constants/dropdowns/integrations/crm-tool-category.options";
import type { AgentCrmToolOption } from "@/features/agents/interfaces/agents.interfaces";

interface ToolRowProps {
  tool: AgentCrmToolOption;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const ToolRow: FC<ToolRowProps> = ({ tool, checked, disabled, onCheckedChange }) => {
  const labelId = useId();

  return (
    <li className="flex items-center gap-4 border-b border-border py-3.5 last:border-b-0">
      <Switch checked={checked} disabled={disabled} onCheckedChange={onCheckedChange} aria-labelledby={labelId} />
      <div className="min-w-0 flex-1">
        <p id={labelId} className="text-sm font-medium">
          {tool.name}
        </p>
        {tool.description ? <p className="text-sm text-muted-foreground">{tool.description}</p> : null}
      </div>
      <Badge variant="outline">{getCrmToolCategoryLabel(tool.category)}</Badge>
    </li>
  );
};

interface CrmToolsPickerProps {
  /** The tools of the agent's CRM connection. */
  tools: AgentCrmToolOption[];
  /** Ids of the tools the agent may use. */
  value: string[];
  onChange: (toolIds: string[]) => void;
  disabled?: boolean;
}

/** One switch per CRM action; nothing is allowed unless it is switched on. */
export const CrmToolsPicker: FC<CrmToolsPickerProps> = ({ tools, value, onChange, disabled }) => {
  if (tools.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
        This CRM has no actions yet. Add some from the connection&apos;s Tools tab.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        {value.length} of {tools.length} allowed
      </p>
      <ul className="rounded-xl border border-border bg-card px-5">
        {tools.map((tool) => (
          <ToolRow
            key={tool.id}
            tool={tool}
            checked={value.includes(tool.id)}
            disabled={disabled}
            onCheckedChange={(checked) =>
              onChange(checked ? [...value, tool.id] : value.filter((toolId) => toolId !== tool.id))
            }
          />
        ))}
      </ul>
      <p className="text-sm text-muted-foreground">
        The AI can only request actions. The platform checks each request before anything is changed.
      </p>
    </div>
  );
};
