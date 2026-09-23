import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateCrmToolDto } from './create-crm-tool.dto';

export class UpdateCrmToolDto extends PartialType(OmitType(CreateCrmToolDto, ['key'] as const)) {}
