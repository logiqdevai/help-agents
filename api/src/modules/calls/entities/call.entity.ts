import { ApiProperty } from '@nestjs/swagger';
import { CallDirection, CallStatus } from 'generated/prisma';

class CallAgentRef {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
}

class CallIntegrationRef {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
}

class CallContactRef {
  @ApiProperty() id: string;
  @ApiProperty({ nullable: true }) name: string | null;
  @ApiProperty({ type: CallIntegrationRef, nullable: true, description: 'CRM connection the contact belongs to' })
  integration: CallIntegrationRef | null;
}

class CallOutcomeRef {
  @ApiProperty() key: string;
  @ApiProperty() label: string;
  @ApiProperty({ nullable: true }) is_successful: boolean | null;
}

export class CallListItem {
  @ApiProperty() id: string;
  @ApiProperty({ description: 'Human friendly number, e.g. #18372' }) call_number: number;
  @ApiProperty({ nullable: true }) started_at: Date | null;
  @ApiProperty() created_at: Date;
  @ApiProperty({ type: CallAgentRef }) agent: CallAgentRef;
  @ApiProperty({ type: CallContactRef, nullable: true }) contact: CallContactRef | null;
  @ApiProperty({ nullable: true }) contact_name: string | null;
  @ApiProperty({ nullable: true }) from_number: string | null;
  @ApiProperty({ nullable: true }) to_number: string | null;
  @ApiProperty({ enum: CallDirection }) direction: CallDirection;
  @ApiProperty({ nullable: true }) duration_seconds: number | null;
  @ApiProperty({ enum: CallStatus }) status: CallStatus;
  @ApiProperty({ type: CallOutcomeRef, nullable: true }) outcome: CallOutcomeRef | null;
  @ApiProperty() total_cost: number;
  @ApiProperty() currency: string;
  @ApiProperty() is_test: boolean;
  @ApiProperty() has_recording: boolean;
  @ApiProperty({ description: 'A CRM update or other action failed and needs attention' }) has_pending_issues: boolean;
  @ApiProperty({ nullable: true, description: 'Why a failed call failed, in plain language' }) failure_reason: string | null;
}

export class CallDetail extends CallListItem {
  @ApiProperty({ nullable: true }) answered_at: Date | null;
  @ApiProperty({ nullable: true }) ended_at: Date | null;
  @ApiProperty() attempt_number: number;
  @ApiProperty({ nullable: true }) in_voicemail: boolean | null;
  @ApiProperty() transferred: boolean;
  @ApiProperty({ nullable: true }) error_message: string | null;
  @ApiProperty({ description: 'Post-call analysis state: PENDING | PROCESSING | COMPLETED | FAILED' }) analysis_status: string;
  @ApiProperty({ description: 'Knowledge sources the agent had at call time', type: 'array', items: { type: 'object' } })
  knowledge_used: Array<{ name: string; version: number | null }>;
  @ApiProperty({ description: 'Details given to the agent before dialing: { key, label, value }', type: 'array', items: { type: 'object' } })
  personalization: Array<{ key: string; label: string; value: string }>;
  @ApiProperty({ nullable: true, description: 'Language the agent was configured with at call time' }) agent_language: string | null;
  @ApiProperty({ nullable: true }) summary: string | null;
  @ApiProperty({ description: 'Transcript segments: { role: agent|customer, text, start?, end? }', type: 'array', items: { type: 'object' } })
  transcript: Array<Record<string, any>>;
  @ApiProperty({ nullable: true }) transcript_text: string | null;
  @ApiProperty({ description: 'Values the agent gathered: { key, label, value }', type: 'array', items: { type: 'object' } })
  information_gathered: Array<Record<string, any>>;
  @ApiProperty({ description: 'CRM / follow-up actions taken after the call', type: 'array', items: { type: 'object' } })
  crm_actions: Array<Record<string, any>>;
  @ApiProperty({ description: 'AI / telephony / total cost with line items', type: Object })
  cost: Record<string, any>;
  @ApiProperty({ description: 'Technical trail of what happened during the call', type: 'array', items: { type: 'object' } })
  activity_log: Array<Record<string, any>>;
  @ApiProperty({ type: Object }) recording: Record<string, any>;
  @ApiProperty({ type: 'array', items: { type: 'object' } }) warnings: Array<Record<string, any>>;
  @ApiProperty({ nullable: true }) transferred_to: string | null;
  @ApiProperty({ nullable: true }) transfer_reason: string | null;
}
