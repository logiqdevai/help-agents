import { KnowledgeSourceTypes, type KnowledgeSourceType } from "@/features/knowledge/interfaces/knowledge.interfaces";

/** Canonical display labels for every knowledge source type, including the connectors that are coming soon. */
export const KnowledgeSourceTypeOptions: { id: KnowledgeSourceType; label: string }[] = [
  { id: KnowledgeSourceTypes.TEXT, label: "Typed text" },
  { id: KnowledgeSourceTypes.FILE, label: "Uploaded file" },
  { id: KnowledgeSourceTypes.GOOGLE_DOCS, label: "Google Docs" },
  { id: KnowledgeSourceTypes.NOTION, label: "Notion" },
  { id: KnowledgeSourceTypes.GOOGLE_DRIVE, label: "Google Drive" },
  { id: KnowledgeSourceTypes.DROPBOX, label: "Dropbox" },
  { id: KnowledgeSourceTypes.SHAREPOINT, label: "SharePoint" },
];
