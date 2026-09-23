import { PartialType, PickType } from '@nestjs/swagger';
import { CreateScheduledCallDto } from './create-scheduled-call.dto';

/** Only the schedule can change while a call is PENDING. */
export class UpdateScheduledCallDto extends PartialType(
  PickType(CreateScheduledCallDto, ['when'] as const),
) {}
