import { Body, Controller, Delete, Get, HttpCode, Ip, Param, ParseUUIDPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { MembersService } from '../services/members.service';
import { InvitationsService } from '../services/invitations.service';
import { CreateInvitationDto, SetAgentAccessDto, UpdateMemberDto } from '../dto/team.dto';
import {
  InvitationsQuerySchema,
  InvitationsQueryType,
  MembersQuerySchema,
  MembersQueryType,
} from '../dto/team-query.schema';
import { ZodValidationPipe } from '@/shared/pipes/zod.validation.pipe';
import {
  CompanyAuth,
  CompanyContext,
  CompanyContextData,
  RequirePermissions,
} from '@/shared/decorators/company.decorator';
import { Permissions } from '@/shared/permissions/permissions';

@ApiTags('Team')
@CompanyAuth()
@Controller('company')
export class TeamController {
  constructor(
    private readonly membersService: MembersService,
    private readonly invitationsService: InvitationsService,
  ) {}

  @Get('members')
  @RequirePermissions(Permissions.TEAM_READ)
  @ApiOperation({ summary: 'List team members' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'role', required: false, enum: ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'] })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  listMembers(
    @CompanyContext() ctx: CompanyContextData,
    @Query(new ZodValidationPipe(MembersQuerySchema)) query: MembersQueryType,
  ) {
    return this.membersService.list(ctx, query);
  }

  @Patch('members/:memberId')
  @RequirePermissions(Permissions.TEAM_MANAGE)
  @ApiOperation({ summary: 'Change a member role or fine-grained permissions' })
  updateMember(
    @CompanyContext() ctx: CompanyContextData,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @Body() dto: UpdateMemberDto,
    @Ip() ip: string,
  ) {
    return this.membersService.update(ctx, memberId, dto, ip);
  }

  @Delete('members/:memberId')
  @RequirePermissions(Permissions.TEAM_MANAGE)
  @ApiOperation({ summary: 'Remove a member from the company' })
  removeMember(
    @CompanyContext() ctx: CompanyContextData,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @Ip() ip: string,
  ) {
    return this.membersService.remove(ctx, memberId, ip);
  }

  @Post('leave')
  @HttpCode(200)
  @RequirePermissions(Permissions.COMPANY_READ)
  @ApiOperation({ summary: 'Leave the current company (the last owner cannot leave)' })
  leave(@CompanyContext() ctx: CompanyContextData, @Ip() ip: string) {
    return this.membersService.leave(ctx, ip);
  }

  @Get('members/:memberId/agent-access')
  @RequirePermissions(Permissions.TEAM_READ)
  @ApiOperation({ summary: 'Agents a member has been given access to' })
  getAgentAccess(
    @CompanyContext() ctx: CompanyContextData,
    @Param('memberId', ParseUUIDPipe) memberId: string,
  ) {
    return this.membersService.getAgentAccess(ctx, memberId);
  }

  @Put('members/:memberId/agent-access')
  @RequirePermissions(Permissions.TEAM_MANAGE)
  @ApiOperation({ summary: 'Replace the agents a member can use and view' })
  setAgentAccess(
    @CompanyContext() ctx: CompanyContextData,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @Body() dto: SetAgentAccessDto,
    @Ip() ip: string,
  ) {
    return this.membersService.setAgentAccess(ctx, memberId, dto, ip);
  }

  @Get('invitations')
  @RequirePermissions(Permissions.TEAM_READ)
  @ApiOperation({ summary: 'List team invitations' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'accepted', 'revoked', 'expired', 'all'] })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  listInvitations(
    @CompanyContext() ctx: CompanyContextData,
    @Query(new ZodValidationPipe(InvitationsQuerySchema)) query: InvitationsQueryType,
  ) {
    return this.invitationsService.list(ctx, query);
  }

  @Post('invitations')
  @RequirePermissions(Permissions.TEAM_MANAGE)
  @ApiOperation({ summary: 'Invite someone to the company by email' })
  invite(@CompanyContext() ctx: CompanyContextData, @Body() dto: CreateInvitationDto, @Ip() ip: string) {
    return this.invitationsService.create(ctx, dto, ip);
  }

  @Post('invitations/:invitationId/resend')
  @HttpCode(200)
  @RequirePermissions(Permissions.TEAM_MANAGE)
  @ApiOperation({ summary: 'Resend an invitation with a fresh link' })
  resendInvitation(
    @CompanyContext() ctx: CompanyContextData,
    @Param('invitationId', ParseUUIDPipe) invitationId: string,
    @Ip() ip: string,
  ) {
    return this.invitationsService.resend(ctx, invitationId, ip);
  }

  @Delete('invitations/:invitationId')
  @RequirePermissions(Permissions.TEAM_MANAGE)
  @ApiOperation({ summary: 'Revoke a pending invitation' })
  revokeInvitation(
    @CompanyContext() ctx: CompanyContextData,
    @Param('invitationId', ParseUUIDPipe) invitationId: string,
    @Ip() ip: string,
  ) {
    return this.invitationsService.revoke(ctx, invitationId, ip);
  }
}
