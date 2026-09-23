import { PartialType, PickType } from '@nestjs/swagger';
import { CreatePricingRateDto } from './create-pricing-rate.dto';

/** Rates are immutable history; only the end of validity can be changed. */
export class UpdatePricingRateDto extends PartialType(PickType(CreatePricingRateDto, ['effective_to'] as const)) {}
