import { CostUnits, type CostUnit } from "@/features/calls/interfaces/calls.interfaces";

// Singular, lowercase: shown after a quantity, e.g. "2.72 min × €0.0993/min".
export const CallCostUnitFormOptions: { id: CostUnit; label: string }[] = [
  { id: CostUnits.SECOND, label: "sec" },
  { id: CostUnits.MINUTE, label: "min" },
  { id: CostUnits.CALL, label: "call" },
  { id: CostUnits.TOKEN, label: "token" },
  { id: CostUnits.MESSAGE, label: "message" },
];
