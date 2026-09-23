import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { CreateKnowledgeDto } from './create-knowledge.dto';

/** JSON body with `content`, or multipart with a `file` (.txt, .md, .doc, .docx). */
export class CreateKnowledgeVersionDto extends PartialType(PickType(CreateKnowledgeDto, ['content'] as const)) {
  @ApiProperty({ type: 'string', format: 'binary', required: false, description: 'Document to extract text from' })
  file?: any;
}
