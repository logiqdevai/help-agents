import { ApiProperty } from '@nestjs/swagger';
import { CallDirection, CallStatus } from 'generated/prisma';

class CallAgentRef {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
}

class CallContactRef {
  @ApiProperty() id: string;
  @ApiProperty({ nullable: true }) name: string | null;
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
}

export class CallDetail extends CallListItem {
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
