import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateKnowledgeDto } from './create-knowledge.dto';

export class UpdateKnowledgeDto extends PartialType(PickType(CreateKnowledgeDto, ['name'] as const)) {
  @ApiProperty({ required: false, description: 'Turn the source off without deleting it' })
  @IsOptional()
  @IsBoolean()
  is_enabled?: boolean;
}
