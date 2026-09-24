import {
  KnowledgeStatusFilters,
  type KnowledgeStatusFilter,
} from "@/features/knowledge/interfaces/knowledge.interfaces";

/** Canonical status labels; "Turned off" is the filter for sources the user switched off. */
export const KnowledgeStatusFilterOptions: { id: KnowledgeStatusFilter | "all"; label: string }[] = [
  { id: "all", label: "All statuses" },
  { id: KnowledgeStatusFilters.READY, label: "Ready" },
  { id: KnowledgeStatusFilters.PROCESSING, label: "Processing" },
  { id: KnowledgeStatusFilters.FAILED, label: "Failed" },
  { id: KnowledgeStatusFilters.DISABLED, label: "Turned off" },
];
