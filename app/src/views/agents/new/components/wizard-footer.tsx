import type { FC, ReactNode } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { Button } from "@/components/ui/button";

interface WizardFooterProps {
  /** Omitted on the first step. */
  onBack?: () => void;
  /** Saves the step and stays on it; omitted when the step has nothing to save. */
  onSaveDraft?: () => void;
  /** Continue acts as the form's submit button unless a click handler is given. */
  onContinue?: () => void;
  continueLabel?: string;
  continueIcon?: ReactNode;
  isPending?: boolean;
  /** Disables saving a draft and continuing, e.g. while a step is incomplete. */
  disabled?: boolean;
}

/** Back, save-draft and continue controls under every step. */
export const WizardFooter: FC<WizardFooterProps> = ({
  onBack,
  onSaveDraft,
  onContinue,
  continueLabel = "Continue",
  continueIcon,
  isPending = false,
  disabled = false,
}) => (
  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/40 px-5 py-4 sm:px-8">
    {onBack ? (
      <Button type="button" variant="outline" onClick={onBack} disabled={isPending}>
        <ArrowLeftIcon />
        Back
      </Button>
    ) : (
      <span />
    )}
    <div className="flex flex-wrap items-center gap-2">
      {onSaveDraft ? (
        <Button type="button" variant="ghost" onClick={onSaveDraft} disabled={isPending || disabled}>
          Save draft
        </Button>
      ) : null}
      <ActionButtonWithPending
        type={onContinue ? "button" : "submit"}
        onClick={onContinue}
        isPending={isPending}
        disabled={disabled}
      >
        {continueLabel}
        {continueIcon ?? <ArrowRightIcon />}
      </ActionButtonWithPending>
    </div>
  </div>
);
