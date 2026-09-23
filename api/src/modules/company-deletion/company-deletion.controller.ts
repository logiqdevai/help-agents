import { Body, Controller, Delete, Get, Ip, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CompanyAuth,
  CompanyContext,
  CompanyContextData,
  RequirePermissions,
} from '@/shared/decorators/company.decorator';
import { Permissions } from '@/shared/permissions/permissions';
import { CompanyDeletionService } from './company-deletion.service';
import { RequestCompanyDeletionDto } from './dto/request-company-deletion.dto';
import { CompanyDeletionStatusEntity } from './entities/company-deletion.entity';

@ApiTags('Company Deletion')
@Controller('company')
@CompanyAuth()
export class CompanyDeletionController {
  constructor(private readonly deletionService: CompanyDeletionService) {}

  @Get('deletion-status')
  @RequirePermissions(Permissions.COMPANY_READ)
  @ApiOperation({ summary: 'Whether the company is scheduled for deletion, and when' })
  @ApiResponse({ status: 200, type: CompanyDeletionStatusEntity })
  getStatus(@CompanyContext('company_uuid') companyUuid: string) {
    return this.deletionService.getStatus(companyUuid);
  }

  @Post('deletion-request')
  @RequirePermissions(Permissions.COMPANY_DELETE)
  @ApiOperation({
    summary: 'Request permanent deletion of the company and all of its data (owner only)',
    description: 'Data is deleted after a grace period; the request can be cancelled until then.',
  })
  @ApiResponse({ status: 201, type: CompanyDeletionStatusEntity })
  @ApiResponse({ status: 400, description: 'Wrong password or company name' })
  @ApiResponse({ status: 409, description: 'A deletion request is already pending' })
  requestDeletion(
    @CompanyContext() ctx: CompanyContextData,
    @Body() dto: RequestCompanyDeletionDto,
    @Ip() ip: string,
  ) {
    return this.deletionService.requestDeletion(ctx, dto, ip);
  }

  @Delete('deletion-request')
  @RequirePermissions(Permissions.COMPANY_DELETE)
  @ApiOperation({ summary: 'Cancel a pending deletion request (owner only)' })
  @ApiResponse({ status: 200, type: CompanyDeletionStatusEntity })
  @ApiResponse({ status: 404, description: 'No pending deletion request' })
  cancelDeletion(@CompanyContext() ctx: CompanyContextData, @Ip() ip: string) {
    return this.deletionService.cancelDeletion(ctx, ip);
  }
}
