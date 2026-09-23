import { Body, Controller, Get, Ip, Patch, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CompaniesService } from '../services/companies.service';
import { UpdateCompanyDto } from '../dto/update-company.dto';
import { SetCallingHoursDto } from '../dto/calling-hours.dto';
import { JwtGuard } from '@/shared/guards/jwt.guard';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import {
  CompanyAuth,
  CompanyContext,
  CompanyContextData,
  RequirePermissions,
} from '@/shared/decorators/company.decorator';
import { Permissions } from '@/shared/permissions/permissions';

@ApiTags('Companies')
@Controller()
export class CompanyController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get('companies')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Companies the current user belongs to (for switching accounts)' })
  listMine(@CurrentUser('id') userUuid: string) {
    return this.companiesService.listForUser(userUuid);
  }

  @Get('company')
  @CompanyAuth()
  @RequirePermissions(Permissions.COMPANY_READ)
  @ApiOperation({ summary: 'Current company with the caller role and permissions' })
  getCurrent(@CompanyContext() ctx: CompanyContextData) {
    return this.companiesService.getCurrent(ctx);
  }

  @Patch('company')
  @CompanyAuth()
  @RequirePermissions(Permissions.COMPANY_MANAGE)
  @ApiOperation({ summary: 'Update company details, timezone and recording retention' })
  update(@CompanyContext() ctx: CompanyContextData, @Body() dto: UpdateCompanyDto, @Ip() ip: string) {
    return this.companiesService.update(ctx, dto, ip);
  }

  @Get('company/calling-hours')
  @CompanyAuth()
  @RequirePermissions(Permissions.COMPANY_READ)
  @ApiOperation({ summary: 'Allowed calling hours per weekday (company timezone)' })
  getCallingHours(@CompanyContext() ctx: CompanyContextData) {
    return this.companiesService.getCallingHours(ctx);
  }

  @Put('company/calling-hours')
  @CompanyAuth()
  @RequirePermissions(Permissions.COMPANY_MANAGE)
  @ApiOperation({ summary: 'Set allowed calling hours per weekday' })
  @ApiResponse({ status: 400, description: 'Invalid or overlapping hours' })
  setCallingHours(@CompanyContext() ctx: CompanyContextData, @Body() dto: SetCallingHoursDto, @Ip() ip: string) {
    return this.companiesService.setCallingHours(ctx, dto, ip);
  }
}
