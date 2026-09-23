import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateCallDto {
  @ApiProperty({ description: 'Agent that makes the call' })
  @IsUUID()
  agent_uuid: string;

  @ApiProperty({ required: false, description: 'Existing contact to call' })
  @IsOptional()
  @IsUUID()
  contact_uuid?: string;

  @ApiProperty({ required: false, description: 'Phone number to call (E.164 preferred). Required without contact_uuid.', example: '+306912345678' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;

  @ApiProperty({ required: false, description: 'Name of the person being called', example: 'Maria Papadopoulou' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;
}
