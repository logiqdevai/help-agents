import { GoalDataTypes, type GoalDataType } from "@/features/agents/interfaces/agents.interfaces";

/** The kind of answer a goal item collects. */
export const GoalDataTypeFormOptions: { id: GoalDataType; label: string }[] = [
  { id: GoalDataTypes.BOOLEAN, label: "Yes / No" },
  { id: GoalDataTypes.STRING, label: "Text" },
  { id: GoalDataTypes.NUMBER, label: "Number" },
  { id: GoalDataTypes.DATE, label: "Date" },
  { id: GoalDataTypes.ENUM, label: "Choice" },
];
