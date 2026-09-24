import { Fragment, type FC } from "react";
import { formatDelayMinutes } from "@/views/agents/utils/retry-format";

interface RetryFlowPreviewProps {
  isEnabled: boolean;
  /** As typed in the form; incomplete values simply hide the part of the picture they belong to. */
  maxAttempts: string;
  delays: string[];
}

const MAX_ATTEMPTS = 10;
const MAX_DELAY_MINUTES = 525600;

const toWait = (value: string | undefined): string | null => {
  const minutes = Number(value);
  return Number.isInteger(minutes) && minutes >= 1 && minutes <= MAX_DELAY_MINUTES ? formatDelayMinutes(minutes) : null;
};

/** A short story of what the retry rule does to a call that keeps failing. */
export const RetryFlowPreview: FC<RetryFlowPreviewProps> = ({ isEnabled, maxAttempts, delays }) => {
  const attempts = Number(maxAttempts);

  if (!isEnabled) {
    return (
      <p className="text-sm text-muted-foreground">
        Retries are off. A call that does not go through is not tried again.
      </p>
    );
  }
  if (!Number.isInteger(attempts) || attempts < 1 || attempts > MAX_ATTEMPTS) {
    return <p className="text-sm text-muted-foreground">Set the number of attempts to see how it plays out.</p>;
  }

  return (
    <ol className="flex flex-col">
      {Array.from({ length: attempts }, (_, index) => {
        const wait = index < attempts - 1 ? toWait(delays[index]) : null;
        return (
          <Fragment key={index}>
            <li className="flex items-center gap-3 py-2.5 text-sm">
              <span
                aria-hidden="true"
                className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold"
              >
                {index + 1}
              </span>
              <span>{index === 0 ? "Attempt 1: the call does not go through" : `Attempt ${index + 1}: still not connected`}</span>
            </li>
            {index < attempts - 1 ? (
              <li className="ml-3 border-l border-dashed border-border py-1 pl-6 text-xs text-muted-foreground">
                {wait ? `wait ${wait}` : "wait"}
              </li>
            ) : null}
          </Fragment>
        );
      })}
      <li className="ml-3 border-l border-dashed border-border py-1 pl-6 text-xs text-muted-foreground">
        {attempts === 1 ? "no retries" : "then stop trying"}
      </li>
    </ol>
  );
};
