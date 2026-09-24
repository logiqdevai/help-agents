import { KnowledgeSourceTypes, type KnowledgeSourceType } from "@/features/knowledge/interfaces/knowledge.interfaces";

/** Connectors that are not available yet, with the short mark shown on their tile. Labels live in knowledge-source-type.options.ts. */
export const KnowledgeConnectorOptions: { id: KnowledgeSourceType; mark: string }[] = [
  { id: KnowledgeSourceTypes.GOOGLE_DOCS, mark: "G" },
  { id: KnowledgeSourceTypes.NOTION, mark: "N" },
  { id: KnowledgeSourceTypes.GOOGLE_DRIVE, mark: "Dr" },
  { id: KnowledgeSourceTypes.DROPBOX, mark: "Db" },
  { id: KnowledgeSourceTypes.SHAREPOINT, mark: "SP" },
];
