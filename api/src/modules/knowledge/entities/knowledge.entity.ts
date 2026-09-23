import { ApiProperty } from '@nestjs/swagger';
import { KnowledgeSourceType, KnowledgeStatus } from 'generated/prisma';

export class KnowledgeUser {
  @ApiProperty()
  id: string;

  @ApiProperty({ nullable: true })
  name: string | null;
}

export class KnowledgeAgent {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}

export class KnowledgeVersionSummaryEntity {
  @ApiProperty()
  version: number;

  @ApiProperty({ enum: KnowledgeStatus })
  status: KnowledgeStatus;

  @ApiProperty({ nullable: true })
  error: string | null;

  @ApiProperty()
  is_current: boolean;

  @ApiProperty()
  content_length: number;

  @ApiProperty()
  has_document: boolean;

  @ApiProperty({ type: KnowledgeUser, nullable: true })
  created_by: KnowledgeUser | null;

  @ApiProperty()
  created_at: Date;

  @ApiProperty({ nullable: true, description: 'When the AI last received this version' })
  indexed_at: Date | null;
}

export class KnowledgeVersionDetailEntity extends KnowledgeVersionSummaryEntity {
  @ApiProperty()
  content: string;

  @ApiProperty({ nullable: true })
  document: { id: string; filename: string; mimetype: string; size: number } | null;
}

export class KnowledgeSource {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'Property FAQ' })
  name: string;

  @ApiProperty({ enum: KnowledgeSourceType })
  type: KnowledgeSourceType;

  @ApiProperty({ enum: KnowledgeStatus, description: 'PROCESSING until agents can use it' })
  status: KnowledgeStatus;

  @ApiProperty()
  is_enabled: boolean;

  @ApiProperty()
  current_version: number;

  @ApiProperty({ nullable: true })
  last_error: string | null;

  @ApiProperty({ type: KnowledgeUser, nullable: true })
  added_by: KnowledgeUser | null;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiProperty({ nullable: true })
  last_refreshed_at: Date | null;

  @ApiProperty({ type: [KnowledgeAgent] })
  used_by: KnowledgeAgent[];
}

export class KnowledgeSourceDetail extends KnowledgeSource {
  @ApiProperty({ nullable: true, description: 'Text of the current version' })
  content: string | null;

  @ApiProperty({ type: [KnowledgeVersionSummaryEntity] })
  versions: KnowledgeVersionSummaryEntity[];
}
