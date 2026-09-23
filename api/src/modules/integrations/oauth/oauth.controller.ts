import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { CompanyAuth, CompanyContext, CompanyContextData, RequirePermissions } from '@/shared/decorators/company.decorator';
import { Permissions } from '@/shared/permissions/permissions';
import { OAuthStartDto } from '../dto/oauth-start.dto';
import { OAuthService } from './oauth.service';

@ApiTags('Integrations - OAuth')
@Controller('integrations/oauth')
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

  @Post(':provider/start')
  @CompanyAuth()
  @RequirePermissions(Permissions.INTEGRATIONS_MANAGE)
  @ApiOperation({ summary: 'Start the OAuth2 connect flow; returns the URL to send the user to' })
  start(
    @CompanyContext() ctx: CompanyContextData,
    @Param('provider') provider: string,
    @Body() dto: OAuthStartDto,
  ) {
    return this.oauthService.start(ctx, this.oauthService.parseProvider(provider), dto);
  }

  // Public: the provider redirects the browser here; the signed `state` proves who started the flow.
  @Get('callback')
  @ApiOperation({ summary: 'OAuth2 redirect target (used by the provider, not by API clients)' })
  async callback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Query('error') error: string | undefined,
    @Res() res: Response,
  ) {
    const url = await this.oauthService.handleCallback({ code, state, error });
    res.redirect(url);
  }
}
