import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CompanyAuth, CompanyContext, RequirePermissions } from '@/shared/decorators/company.decorator';
import { Permissions } from '@/shared/permissions/permissions';
import { PricingRatesService } from '../services/pricing-rates.service';

@ApiTags('Pricing')
@Controller('pricing')
@CompanyAuth()
export class PricingController {
  constructor(private readonly rates: PricingRatesService) {}

  @Get()
  @RequirePermissions(Permissions.ANALYTICS_READ)
  @ApiOperation({ summary: 'Rates currently applied to the company' })
  @ApiResponse({ status: 200, description: 'Effective rates (company overrides win over platform defaults)' })
  async findEffective(@CompanyContext('company_uuid') companyUuid: string) {
    return { data: await this.rates.findEffectiveForCompany(companyUuid) };
  }
}
