import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UploadKnowledgeDto {
  @ApiProperty({ type: 'string', format: 'binary', description: '.txt, .md, .doc or .docx, up to 10 MB' })
  file: any;

  @ApiProperty({ required: false, description: 'Defaults to the file name' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name?: string;
}
