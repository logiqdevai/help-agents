import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class CrmToolHttpDto {
  @ApiProperty({ enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] })
  @IsIn(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
  method: string;

  @ApiProperty({ description: 'Path relative to the base URL; {placeholders} are filled from the tool input', example: '/contacts/{contact_id}/notes' })
  @IsString()
  @Matches(/^\//, { message: 'path must start with "/"' })
  @MaxLength(500)
  path: string;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true, description: 'Query parameters template' })
  @IsOptional()
  @IsObject()
  query?: Record<string, any>;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true, description: 'JSON body template' })
  @IsOptional()
  @IsObject()
  body?: Record<string, any>;
}

export class CreateCrmToolDto {
  @ApiProperty({ description: 'Stable snake_case identifier', example: 'add_customer_note' })
  @IsString()
  @Matches(/^[a-z][a-z0-9_]{2,63}$/, { message: 'key must be snake_case, 3-64 characters' })
  key: string;

  @ApiProperty({ example: 'Add a note to a customer' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name: string;

  @ApiPropertyOptional({ description: 'Explains to the AI when to use the tool' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: 'notes' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  category?: string;

  @ApiProperty({
    description: 'JSON schema (type "object") of the input the AI must provide',
    type: 'object',
    additionalProperties: true,
    example: { type: 'object', properties: { customer_id: { type: 'string' }, note: { type: 'string' } }, required: ['customer_id', 'note'] },
  })
  @IsObject()
  input_schema: Record<string, any>;

  @ApiProperty({ type: CrmToolHttpDto })
  @ValidateNested()
  @Type(() => CrmToolHttpDto)
  http: CrmToolHttpDto;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
