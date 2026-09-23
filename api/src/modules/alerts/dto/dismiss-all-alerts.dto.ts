import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { AlertType } from 'generated/prisma';

export class DismissAllAlertsDto {
  @ApiPropertyOptional({ enum: AlertType, description: 'Only dismiss alerts of this type' })
  @IsOptional()
  @IsEnum(AlertType)
  type?: AlertType;
}
