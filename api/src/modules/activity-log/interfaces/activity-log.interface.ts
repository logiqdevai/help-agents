import { ActorType } from 'generated/prisma';

export interface ActivityLogItem {
  id: string;
  actor: { id: string; name: string | null; email: string } | null;
  actor_type: ActorType;
  action: string;
  entity_type: string | null;
  entity_uuid: string | null;
  /** Human-readable name of the affected record when it can be resolved (e.g. "Call #18372"). */
  entity_label: string | null;
  metadata: unknown;
  ip_address: string | null;
  created_at: Date;
}
