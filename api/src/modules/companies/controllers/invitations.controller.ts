import { Body, Controller, Get, HttpCode, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { InvitationsService } from '../services/invitations.service';
import { AcceptInvitationDto } from '../dto/team.dto';
import {
  InvitationPreviewQuerySchema,
  InvitationPreviewQueryType,
} from '../dto/team-query.schema';
import { ZodValidationPipe } from '@/shared/pipes/zod.validation.pipe';
import { JwtGuard } from '@/shared/guards/jwt.guard';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';

@ApiTags('Invitations')
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Get('preview')
  @ApiOperation({ summary: 'Public: see which company an invitation is for' })
  @ApiQuery({ name: 'token', required: true })
  preview(@Query(new ZodValidationPipe(InvitationPreviewQuerySchema)) query: InvitationPreviewQueryType) {
    return this.invitationsService.preview(query.token);
  }

  @Post('accept')
  @HttpCode(200)
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Accept an invitation as the logged-in user (email must match)' })
  accept(@CurrentUser('id') userUuid: string, @Body() dto: AcceptInvitationDto) {
    return this.invitationsService.accept(userUuid, dto.token);
  }
}
