import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '@/shared/guards/jwt.guard';
import { RolesGuard } from '@/shared/guards/roles.guard';
import { Roles } from '@/shared/decorators/roles.decorator';
import { ZodValidationPipe } from '@/shared/pipes/zod.validation.pipe';
import { PricingRatesService } from '../services/pricing-rates.service';
import { CreatePricingRateDto } from '../dto/create-pricing-rate.dto';
import { UpdatePricingRateDto } from '../dto/update-pricing-rate.dto';
import { PricingRateQuerySchema, PricingRateQueryType } from '../dto/pricing-rate-query.schema';

@ApiTags('Pricing (admin)')
@ApiBearerAuth()
@Controller('admin/pricing-rates')
@UseGuards(JwtGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN')
export class PricingAdminController {
  constructor(private readonly rates: PricingRatesService) {}

  @Get()
  @ApiOperation({ summary: 'List pricing rates (platform staff)' })
  findAll(@Query(new ZodValidationPipe(PricingRateQuerySchema)) query: PricingRateQueryType) {
    return this.rates.findAll(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a pricing rate; closes the previous open rate of the same key' })
  @ApiResponse({ status: 201, description: 'Rate created' })
  create(@Body() dto: CreatePricingRateDto) {
    return this.rates.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'End the validity of a pricing rate' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePricingRateDto) {
    return this.rates.update(id, dto);
  }
}
