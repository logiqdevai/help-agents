import { PartialType, PickType } from '@nestjs/swagger';
import { ProvisionPhoneNumberDto } from './provision-phone-number.dto';

export class UpdatePhoneNumberDto extends PartialType(PickType(ProvisionPhoneNumberDto, ['label'] as const)) {}
