import type { FC } from "react";
import { BotIcon } from "lucide-react";
import type { KnowledgeAgentRef } from "@/features/knowledge/interfaces/knowledge.interfaces";
import { cn } from "@/lib/utils";

// Decorative pastel marks, cycled by position (DESIGN.MD: gradients are atmosphere, never meaning).
const markTones = [
  "bg-gradient-mint/60",
  "bg-gradient-lavender/60",
  "bg-gradient-peach/60",
  "bg-gradient-sky/60",
  "bg-gradient-rose/60",
];

const MAX_MARKS = 3;

interface UsedByAgentsProps {
  agents: KnowledgeAgentRef[];
}

/** Compact "which agents use this" cell: stacked marks plus a name or count. */
export const UsedByAgents: FC<UsedByAgentsProps> = ({ agents }) => {
  if (!agents.length) return <span className="text-sm text-muted-foreground">Not used yet</span>;

  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <span className="flex items-center" aria-hidden="true">
        {agents.slice(0, MAX_MARKS).map((agent, index) => (
          <span
            key={agent.id}
            className={cn(
              "flex size-7 items-center justify-center rounded-full ring-2 ring-card",
              markTones[index % markTones.length],
              index > 0 && "-ml-2",
            )}
          >
            <BotIcon className="size-3.5" />
          </span>
        ))}
      </span>
      <span className="text-sm">{agents.length === 1 ? agents[0].name : `${agents.length} agents`}</span>
    </div>
  );
};
