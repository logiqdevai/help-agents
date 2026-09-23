import { ArrayMaxSize, IsArray, IsEmail, IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CompanyRole } from 'generated/prisma';

export class UpdateMemberDto {
  @ApiProperty({ enum: CompanyRole, required: false })
  @IsOptional()
  @IsEnum(CompanyRole)
  role?: CompanyRole;

  @ApiProperty({
    required: false,
    type: [String],
    description: 'Extra fine-grained permissions granted on top of the role (e.g. "knowledge.write")',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(64)
  @IsString({ each: true })
  permissions?: string[];
}

export class SetAgentAccessDto {
  @ApiProperty({ type: [String], description: 'Agents the member may use and view' })
  @IsArray()
  @ArrayMaxSize(500)
  @IsUUID('all', { each: true })
  agent_uuids: string[];
}

export class CreateInvitationDto {
  @ApiProperty({ example: 'colleague@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ enum: CompanyRole, default: CompanyRole.MEMBER })
  @IsEnum(CompanyRole)
  role: CompanyRole;
}

export class AcceptInvitationDto {
  @ApiProperty({ description: 'Invitation token from the email link' })
  @IsString()
  @MinLength(1)
  token: string;
}
