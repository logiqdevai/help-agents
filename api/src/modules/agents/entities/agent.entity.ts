import { ApiProperty } from '@nestjs/swagger';
import { AgentStatus } from 'generated/prisma';

export class AgentCrmRef {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty({ example: 'HUBSPOT' }) provider: string;
  @ApiProperty({ example: 'ACTIVE' }) status: string;
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
  @ApiProperty({ nullable: true }) last_call_at: Date | null;
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

export class AgentOutcomeCountEntity {
  @ApiProperty({ nullable: true }) key: string | null;
  @ApiProperty({ nullable: true }) label: string | null;
  @ApiProperty() is_successful: boolean;
  @ApiProperty() count: number;
}

export class AgentPeriodStatsEntity {
  @ApiProperty() total_calls: number;
  @ApiProperty() successful_calls: number;
  @ApiProperty({ nullable: true }) success_rate: number | null;
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
  @ApiProperty({ nullable: true }) activated_at: Date | null;
  @ApiProperty({ description: 'Calls placed or received today, in the company timezone.' }) calls_today: number;
  @ApiProperty() calls_yesterday: number;
  @ApiProperty({ type: AgentPeriodStatsEntity, description: 'Calls of the last 30 days.' })
  last_30_days: AgentPeriodStatsEntity;
  @ApiProperty({ type: [AgentOutcomeCountEntity], description: 'Outcomes of the last 30 days, most frequent first.' })
  outcomes_30_days: AgentOutcomeCountEntity[];
  @ApiProperty({ type: AgentReadinessEntity }) readiness: AgentReadinessEntity;
  @ApiProperty() unresolved_alerts: number;
}

export class AgentAccessUserEntity {
  @ApiProperty() id: string;
  @ApiProperty({ nullable: true }) name: string | null;
  @ApiProperty() email: string;
}

export class AgentAccessMemberEntity {
  @ApiProperty() member_uuid: string;
  @ApiProperty({ example: 'MEMBER' }) role: string;
  @ApiProperty({ description: 'Owners, admins and viewers see every agent regardless of grants.' })
  unrestricted: boolean;
  @ApiProperty() has_access: boolean;
  @ApiProperty({ type: AgentAccessUserEntity }) user: AgentAccessUserEntity;
}

export class AgentAccessListEntity {
  @ApiProperty() agent_uuid: string;
  @ApiProperty({ type: [AgentAccessMemberEntity] }) members: AgentAccessMemberEntity[];
}
