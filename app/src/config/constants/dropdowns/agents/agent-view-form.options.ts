export const AgentViews = {
  CARDS: "cards",
  TABLE: "table",
} as const;
export type AgentView = (typeof AgentViews)[keyof typeof AgentViews];

export const AgentViewFormOptions: { id: AgentView; label: string }[] = [
  { id: AgentViews.CARDS, label: "Cards" },
  { id: AgentViews.TABLE, label: "Table" },
];
