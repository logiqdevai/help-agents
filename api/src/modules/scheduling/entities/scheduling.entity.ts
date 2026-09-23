import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RetryTrigger, ScheduledCallSource, ScheduledCallStatus } from 'generated/prisma';

export class ScheduledCallEntity {
  @ApiProperty() id: string;
  @ApiProperty() agent_uuid: string;
  @ApiProperty() contact_uuid: string;
  @ApiProperty({ enum: ScheduledCallSource }) source: ScheduledCallSource;
  @ApiProperty({ enum: ScheduledCallStatus }) status: ScheduledCallStatus;
  @ApiProperty() scheduled_for: Date;
  @ApiProperty() attempt_number: number;
  @ApiPropertyOptional({ nullable: true }) closed_reason: string | null;
  @ApiProperty() created_at: Date;
  @ApiProperty({ type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' } } })
  agent: { id: string; name: string };
  @ApiProperty({
    type: 'object',
    properties: { id: { type: 'string' }, name: { type: 'string' }, phone: { type: 'string' } },
  })
  contact: { id: string; name: string | null; phone: string | null };
}

export class RetryRuleEntity {
  @ApiPropertyOptional({ nullable: true }) id: string | null;
  @ApiProperty() agent_uuid: string;
  @ApiProperty() is_enabled: boolean;
  @ApiProperty() max_attempts: number;
  @ApiProperty({ type: [Number] }) delays_minutes: number[];
  @ApiProperty({ enum: RetryTrigger, isArray: true }) retry_on: RetryTrigger[];
  @ApiPropertyOptional({ nullable: true, type: 'object', additionalProperties: true })
  calling_hours_override: Record<string, any> | null;
  @ApiProperty({ description: 'false when returning defaults for an agent without a stored rule' })
  configured: boolean;
}
