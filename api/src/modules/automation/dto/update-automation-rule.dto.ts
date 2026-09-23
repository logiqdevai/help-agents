import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';
import { CreateAutomationRuleDto } from './create-automation-rule.dto';

/** When `actions` is sent it replaces the rule's whole action list. */
export class UpdateAutomationRuleDto extends PartialType(CreateAutomationRuleDto) {}

export class SetRuleEnabledDto {
  @ApiProperty()
  @IsBoolean()
  is_enabled: boolean;
}
