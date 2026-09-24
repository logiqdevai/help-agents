import { z } from "zod";
import { KnowledgeAddModes } from "@/features/knowledge/interfaces/knowledge.interfaces";

const KNOWLEDGE_MAX_CONTENT_CHARS = 500_000;
const KNOWLEDGE_MAX_FILE_BYTES = 10 * 1024 * 1024;
export const KNOWLEDGE_ACCEPTED_EXTENSIONS = [".txt", ".md", ".doc", ".docx"] as const;

/** Client-side mirror of the API's file check, so bad files are flagged before uploading. Null when the file is fine. */
export function getKnowledgeFileError(file: File): string | null {
  const name = file.name.toLowerCase();
  if (!KNOWLEDGE_ACCEPTED_EXTENSIONS.some((extension) => name.endsWith(extension))) {
    return "This file type isn't supported. Use .txt, .md, .doc or .docx.";
  }
  if (file.size > KNOWLEDGE_MAX_FILE_BYTES) return "This file is larger than 10 MB.";
  if (file.size === 0) return "This file is empty.";
  return null;
}

const contentSchema = z.string().max(KNOWLEDGE_MAX_CONTENT_CHARS, "This is too long. Split it into several sources.");

export const knowledgeFormSchema = z
  .object({
    mode: z.enum([KnowledgeAddModes.TEXT, KnowledgeAddModes.FILE]),
    name: z.string().trim().max(200, "Keep the name under 200 characters"),
    content: contentSchema,
    files: z.array(z.instanceof(File)),
    agent_uuids: z.array(z.string()),
  })
  .superRefine((values, ctx) => {
    if (values.mode === KnowledgeAddModes.TEXT) {
      if (!values.name) ctx.addIssue({ code: "custom", path: ["name"], message: "Name is required" });
      if (!values.content.trim()) ctx.addIssue({ code: "custom", path: ["content"], message: "Add some content" });
      return;
    }
    if (!values.files.length) {
      ctx.addIssue({ code: "custom", path: ["files"], message: "Add at least one file" });
    } else if (values.files.some((file) => getKnowledgeFileError(file))) {
      ctx.addIssue({ code: "custom", path: ["files"], message: "Remove the files that can't be added" });
    }
  });

export type KnowledgeFormValues = z.infer<typeof knowledgeFormSchema>;

export const knowledgeVersionFormSchema = z
  .object({
    mode: z.enum([KnowledgeAddModes.TEXT, KnowledgeAddModes.FILE]),
    content: contentSchema,
    file: z.instanceof(File).nullable(),
  })
  .superRefine((values, ctx) => {
    if (values.mode === KnowledgeAddModes.TEXT) {
      if (!values.content.trim()) ctx.addIssue({ code: "custom", path: ["content"], message: "Add some content" });
      return;
    }
    const fileError = values.file ? getKnowledgeFileError(values.file) : "Choose a file";
    if (fileError) ctx.addIssue({ code: "custom", path: ["file"], message: fileError });
  });

export type KnowledgeVersionFormValues = z.infer<typeof knowledgeVersionFormSchema>;
