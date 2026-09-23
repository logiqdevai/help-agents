import { ApiProperty } from '@nestjs/swagger';
import { AgentStatus } from 'generated/prisma';

export class AgentCrmRef {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty({ example: 'HUBSPOT' }) provider: string;
}

export class AgentPhoneRef {
  @ApiProperty() id: string;
  @ApiProperty({ example: '+302101234567' }) number: string;
}

export class AgentListItemEntity {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty({ nullable: true }) description: string | null;
  @ApiProperty({ nullable: true }) purpose: string | null;
  @ApiProperty({ enum: AgentStatus }) status: AgentStatus;
  @ApiProperty() language: string;
  @ApiProperty({ nullable: true }) voice: string | null;
  @ApiProperty({ type: AgentCrmRef, nullable: true }) crm_integration: AgentCrmRef | null;
  @ApiProperty({ type: [AgentPhoneRef] }) phone_numbers: AgentPhoneRef[];
  @ApiProperty() knowledge_sources_count: number;
  @ApiProperty() calls_made: number;
  @ApiProperty({ nullable: true, description: 'Percent of finished calls that were successful.' })
  success_rate: number | null;
  @ApiProperty() created_at: Date;
  @ApiProperty() updated_at: Date;
}

export class ReadinessBlockerEntity {
  @ApiProperty({ example: 'NO_PHONE_NUMBER' }) code: string;
  @ApiProperty() message: string;
}

export class AgentReadinessEntity {
  @ApiProperty() is_ready: boolean;
  @ApiProperty({ type: [ReadinessBlockerEntity] }) blockers: ReadinessBlockerEntity[];
  @ApiProperty({ type: [String] }) warnings: string[];
  @ApiProperty({
    description: 'Wizard steps (basics, behavior, knowledge, crm, phone, test, activate) with completion flags.',
    type: 'object',
    additionalProperties: true,
  })
  steps: Record<string, { complete: boolean; optional?: boolean }>;
}

export class AgentOverviewEntity {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty({ enum: AgentStatus }) status: AgentStatus;
  @ApiProperty({ nullable: true }) goal: string | null;
  @ApiProperty() knowledge_sources_count: number;
  @ApiProperty({ type: AgentCrmRef, nullable: true }) crm_integration: AgentCrmRef | null;
  @ApiProperty({ type: [AgentPhoneRef] }) phone_numbers: AgentPhoneRef[];
  @ApiProperty({ nullable: true }) voice: string | null;
  @ApiProperty() language: string;
  @ApiProperty() calls_made: number;
  @ApiProperty({ nullable: true }) success_rate: number | null;
  @ApiProperty({ nullable: true }) average_duration_seconds: number | null;
  @ApiProperty({ nullable: true }) average_cost: number | null;
  @ApiProperty() currency: string;
  @ApiProperty({ nullable: true }) last_call_at: Date | null;
  @ApiProperty({ type: AgentReadinessEntity }) readiness: AgentReadinessEntity;
  @ApiProperty() unresolved_alerts: number;
}
