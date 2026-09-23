import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class AssignAgentDto {
  @ApiProperty({ nullable: true, description: 'Agent to assign, or null to unassign the number' })
  @IsOptional()
  @IsUUID()
  agent_uuid?: string | null;
}
