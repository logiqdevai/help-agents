import { useCallback, useEffect, useState } from "react";
import type { EditSection, SetSectionDirty } from "../types";

/** Tracks which sections of the edit page have unsaved changes and warns before the tab is closed. */
export function useUnsavedChanges() {
  const [dirtySections, setDirtySections] = useState<ReadonlySet<EditSection>>(new Set());

  const setSectionDirty = useCallback<SetSectionDirty>((section, isDirty) => {
    setDirtySections((current) => {
      if (current.has(section) === isDirty) return current;
      const next = new Set(current);
      if (isDirty) next.add(section);
      else next.delete(section);
      return next;
    });
  }, []);

  const hasUnsaved = dirtySections.size > 0;

  useEffect(() => {
    if (!hasUnsaved) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [hasUnsaved]);

  return { dirtySections, hasUnsaved, setSectionDirty };
}

/** Reports a section's dirty state to the page, and clears it when the section goes away. */
export function useReportDirty(section: EditSection, isDirty: boolean, setSectionDirty: SetSectionDirty) {
  useEffect(() => {
    setSectionDirty(section, isDirty);
    return () => setSectionDirty(section, false);
  }, [section, isDirty, setSectionDirty]);
}
