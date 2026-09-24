import { KnowledgeAddModes, type KnowledgeAddMode } from "@/features/knowledge/interfaces/knowledge.interfaces";

export const KnowledgeAddModeFormOptions: { id: KnowledgeAddMode; label: string }[] = [
  { id: KnowledgeAddModes.TEXT, label: "Type it directly" },
  { id: KnowledgeAddModes.FILE, label: "Upload a file" },
];
