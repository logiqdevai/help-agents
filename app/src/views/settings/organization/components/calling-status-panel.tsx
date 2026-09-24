"use client";

import type { FC } from "react";
import { useState } from "react";
import type { CallingHours } from "@/features/company/interfaces/company.interfaces";
import { OrbPanel } from "../../components/orb-panel";
import { CallingStatuses, getCallingWindowState } from "../utils/calling-status.utils";

interface CallingStatusPanelProps {
  hours: CallingHours;
}

/** "Right now" panel: whether agents may place calls at this moment, in the company timezone. */
export const CallingStatusPanel: FC<CallingStatusPanelProps> = ({ hours }) => {
  // Captured once per page view; the state only changes on the scale of hours.
  const [now] = useState(() => new Date());
  const state = getCallingWindowState(hours, now);
  const city = hours.timezone.split("/").pop()?.replace(/_/g, " ") ?? hours.timezone;

  return (
    <OrbPanel>
      <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Right now</p>
      <p className="mt-2 font-display text-3xl leading-tight font-light tracking-tight">
        {state.status === CallingStatuses.OPEN ? "Calling is open" : "Calling paused for now"}
      </p>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {state.localNow} in {city}.{" "}
        {state.status === CallingStatuses.OPEN
          ? `Agents may place calls ${state.detail}.`
          : state.detail
            ? `Scheduled calls wait until ${state.detail}.`
            : "No calling window is enabled, so no automated calls will be placed."}
      </p>
    </OrbPanel>
  );
};
