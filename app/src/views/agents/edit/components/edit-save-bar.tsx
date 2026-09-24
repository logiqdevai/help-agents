import type { FC } from "react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { Button } from "@/components/ui/button";

interface EditSaveBarProps {
  /** Shown only while there is something to save. */
  isDirty: boolean;
  isPending: boolean;
  /** A live agent picks up saved changes for its next calls, which the bar says out loud. */
  isLive: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

/** The floating "Unsaved changes" bar with Discard and Save, kept in view while the page scrolls. */
export const EditSaveBar: FC<EditSaveBarProps> = ({ isDirty, isPending, isLive, onSave, onDiscard }) => {
  if (!isDirty) return null;

  return (
    <div
      role="region"
      aria-label="Unsaved changes"
      className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-full border border-hairline-strong bg-card py-3 pr-3 pl-5 shadow-lg"
    >
      <p className="flex min-w-0 items-center gap-2.5 text-sm font-medium">
        <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-foreground" />
        <span className="min-w-0">
          Unsaved changes
          {isLive ? (
            <span className="hidden font-normal text-muted-foreground sm:inline">
              {" "}
              · saving updates the live agent for its next calls
            </span>
          ) : null}
        </span>
      </p>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onDiscard} disabled={isPending}>
          Discard
        </Button>
        <ActionButtonWithPending type="button" onClick={onSave} isPending={isPending}>
          Save changes
        </ActionButtonWithPending>
      </div>
    </div>
  );
};
