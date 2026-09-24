import { ActorTypes, type ActorType } from "@/features/activity-log/interfaces/activity-log.interfaces";

/** Actor kinds that are not a person. People are added at runtime from the team list. */
export const ActivityActorTypeFilterOptions: { id: ActorType | "all"; label: string }[] = [
  { id: "all", label: "All actors" },
  { id: ActorTypes.AGENT, label: "Agents" },
  { id: ActorTypes.SYSTEM, label: "System" },
];

/** Display name for entries with no signed-in person behind them. */
export const ActivityActorTypeFormOptions: { id: ActorType; label: string }[] = [
  { id: ActorTypes.USER, label: "Team member" },
  { id: ActorTypes.AGENT, label: "Agent" },
  { id: ActorTypes.SYSTEM, label: "System" },
  { id: ActorTypes.PROVIDER, label: "System" },
];
