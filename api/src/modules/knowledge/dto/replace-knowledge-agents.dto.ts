import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsUUID } from 'class-validator';

export class ReplaceKnowledgeAgentsDto {
  @ApiProperty({ type: [String], description: 'Agents that can use this knowledge source. Send [] to detach all.' })
  @IsArray()
  @ArrayMaxSize(200)
  @IsUUID('all', { each: true })
  agent_uuids: string[];
}
