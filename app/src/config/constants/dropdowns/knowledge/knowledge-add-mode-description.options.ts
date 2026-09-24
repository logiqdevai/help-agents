import { KnowledgeAddModes, type KnowledgeAddMode } from "@/features/knowledge/interfaces/knowledge.interfaces";

export const KnowledgeAddModeDescriptions: Record<KnowledgeAddMode, string> = {
  [KnowledgeAddModes.TEXT]: "Write or paste company information, policies, FAQs, product details or scripts.",
  [KnowledgeAddModes.FILE]: "Plain text (.txt), Markdown (.md) or Word documents (.doc, .docx).",
};
