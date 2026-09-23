import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { MAX_KNOWLEDGE_CONTENT_CHARS } from '../utils/knowledge.utils';

export class CreateKnowledgeDto {
  @ApiProperty({ description: 'Name of the knowledge source', example: 'Property FAQ' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @ApiProperty({ description: 'The text agents can draw on', example: 'Our opening hours are 9-18 Mon-Fri.' })
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_KNOWLEDGE_CONTENT_CHARS)
  content: string;
}
