import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsUUID } from 'class-validator';

export class SetAgentMembersDto {
  @ApiProperty({
    type: [String],
    description: 'Members (role MEMBER) who may use and view this agent; every other member loses access',
  })
  @IsArray()
  @ArrayMaxSize(500)
  @IsUUID('all', { each: true })
  member_uuids: string[];
}
