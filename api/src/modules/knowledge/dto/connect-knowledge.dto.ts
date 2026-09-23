import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { KnowledgeSourceType } from 'generated/prisma';

export class ConnectKnowledgeDto {
  @ApiProperty({ example: 'Onboarding guide' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @ApiProperty({ enum: KnowledgeSourceType, example: KnowledgeSourceType.GOOGLE_DOCS })
  @IsEnum(KnowledgeSourceType)
  type: KnowledgeSourceType;

  @ApiProperty({ description: 'Connected integration the content is pulled from' })
  @IsUUID()
  integration_uuid: string;

  @ApiProperty({ description: 'Document id in the external system' })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  external_ref: string;
}
