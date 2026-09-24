import { KnowledgeSourceTypeOptions } from "@/config/constants/dropdowns/knowledge/knowledge-source-type.options";
import { KnowledgeSourceTypes, type KnowledgeSourceType } from "@/features/knowledge/interfaces/knowledge.interfaces";

const FilterableTypes: KnowledgeSourceType[] = [KnowledgeSourceTypes.TEXT, KnowledgeSourceTypes.FILE];

export const KnowledgeTypeFilterOptions: { id: KnowledgeSourceType | "all"; label: string }[] = [
  { id: "all", label: "All types" },
  ...KnowledgeSourceTypeOptions.filter((option) => FilterableTypes.includes(option.id)),
];
