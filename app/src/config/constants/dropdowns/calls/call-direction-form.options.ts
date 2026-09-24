import { CallDirections, type CallDirection } from "@/features/calls/interfaces/calls.interfaces";

export const CallDirectionFormOptions: { id: CallDirection; label: string }[] = [
  { id: CallDirections.OUTBOUND, label: "Outbound" },
  { id: CallDirections.INBOUND, label: "Inbound" },
];
