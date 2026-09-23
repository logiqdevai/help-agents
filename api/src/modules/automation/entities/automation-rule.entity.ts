import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AutomationActionType, AutomationTrigger } from 'generated/prisma';

export class AutomationActionEntity {
  @ApiProperty() id: string;
  @ApiProperty({ enum: AutomationActionType }) type: AutomationActionType;
  @ApiPropertyOptional({ type: 'object', additionalProperties: true, nullable: true }) config: Record<string, any> | null;
  @ApiProperty() delay_minutes: number;
  @ApiProperty() position: number;
}

export class AutomationRuleEntity {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty({ enum: AutomationTrigger }) trigger: AutomationTrigger;
  @ApiPropertyOptional({ nullable: true }) agent_uuid: string | null;
  @ApiPropertyOptional({ nullable: true }) outcome_uuid: string | null;
  @ApiPropertyOptional({ type: 'object', additionalProperties: true, nullable: true }) conditions: Record<string, any> | null;
  @ApiProperty() is_enabled: boolean;
  @ApiProperty() position: number;
  @ApiProperty({ type: [AutomationActionEntity] }) actions: AutomationActionEntity[];
  @ApiProperty() created_at: Date;
  @ApiProperty() updated_at: Date;
}
