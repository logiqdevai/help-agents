"use client";

import type { ChangeEvent, DragEvent, FC } from "react";
import { useState } from "react";
import { CircleAlertIcon, FileTextIcon, UploadIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge, StatusTones } from "@/components/ui/status-badge";
import {
  getKnowledgeFileError,
  KNOWLEDGE_ACCEPTED_EXTENSIONS,
} from "@/features/knowledge/validation-schemas/knowledge.schema";
import { cn } from "@/lib/utils";
import { formatFileSize } from "../utils/file-size.utils";

interface FileDropzoneProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  /** When false, choosing a file replaces the current one. */
  multiple?: boolean;
  invalid?: boolean;
}

/** Drag-and-drop / browse picker for knowledge documents, with per-file validation feedback. */
export const FileDropzone: FC<FileDropzoneProps> = ({ files, onFilesChange, multiple = true, invalid }) => {
  const [isDragging, setIsDragging] = useState(false);

  const addFiles = (incoming: File[]) => {
    if (!incoming.length) return;
    onFilesChange(multiple ? [...files, ...incoming] : incoming.slice(0, 1));
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(event.dataTransfer.files));
  };

  return (
    <div className="flex flex-col gap-4">
      <label
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-[1.5px] border-dashed bg-canvas-soft px-6 py-8 text-center transition-colors",
          "hover:border-foreground has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
          isDragging || invalid ? "border-foreground" : "border-hairline-strong",
          invalid && "border-destructive",
        )}
      >
        <input
          type="file"
          className="sr-only"
          multiple={multiple}
          accept={KNOWLEDGE_ACCEPTED_EXTENSIONS.join(",")}
          onChange={handleChange}
        />
        <span className="flex size-12 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,#fff,var(--color-gradient-mint))]">
          <UploadIcon className="size-5" aria-hidden="true" />
        </span>
        <span className="text-sm font-medium">
          Drag {multiple ? "files" : "a file"} here, or{" "}
          <span className="underline underline-offset-4">browse your computer</span>
        </span>
        <span className="text-sm text-muted-foreground">
          We extract and organise the text so agents can search it live during calls.
        </span>
      </label>

      {files.length ? (
        <ul className="flex flex-col gap-2" aria-label="Selected files">
          {files.map((file, index) => {
            const error = getKnowledgeFileError(file);
            return (
              <li
                key={`${file.name}-${file.size}-${index}`}
                className="flex items-center gap-3 rounded-xl border border-border bg-card px-3.5 py-3"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-[10px]",
                    error ? "bg-destructive/10 text-destructive" : "bg-secondary",
                  )}
                >
                  {error ? <CircleAlertIcon className="size-4" /> : <FileTextIcon className="size-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className={cn("text-xs", error ? "text-destructive" : "text-muted-foreground")}>
                    {error ?? formatFileSize(file.size)}
                  </p>
                </div>
                {error ? null : <StatusBadge tone={StatusTones.SUCCESS}>Ready to upload</StatusBadge>}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => onFilesChange(files.filter((_, fileIndex) => fileIndex !== index))}
                >
                  <XIcon aria-hidden="true" />
                </Button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
};
