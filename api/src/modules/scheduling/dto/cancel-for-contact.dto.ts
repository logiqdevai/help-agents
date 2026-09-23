import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class CancelForContactDto {
  @ApiProperty()
  @IsUUID()
  contact_uuid: string;

  @ApiPropertyOptional({ description: 'Only cancel follow-ups of this agent' })
  @IsOptional()
  @IsUUID()
  agent_uuid?: string;
}
