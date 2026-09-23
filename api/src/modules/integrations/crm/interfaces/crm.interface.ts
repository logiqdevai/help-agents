import { CrmRecordType } from 'generated/prisma';

/** Provider-neutral CRM record returned by adapters. */
export interface CrmRecord {
  external_id: string;
  record_type: CrmRecordType;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  /** Link back to the record in the CRM UI. */
  url?: string | null;
  /** Raw properties keyed by the CRM's own field names (used for field mappings). */
  properties: Record<string, any>;
}

export interface CrmLookupQuery {
  phone?: string;
  email?: string;
  external_id?: string;
  record_type?: CrmRecordType;
}

export interface CrmExecuteToolInput {
  company_uuid: string;
  integration_uuid: string;
  /** Either a CrmTool.key of the connected CRM or a canonical key (CANONICAL_ACTION_KEYS.CRM_*). */
  tool_key: string;
  input: Record<string, any>;
}

export interface CrmExecuteToolResult {
  success: boolean;
  result?: any;
}

/** Everything the post-call CRM sync needs; adapters apply it through the field mappings. */
export interface CrmCallResultInput {
  company_uuid: string;
  integration_uuid: string;
  agent_uuid: string;
  call_uuid: string;
  contact_uuid?: string | null;
}
