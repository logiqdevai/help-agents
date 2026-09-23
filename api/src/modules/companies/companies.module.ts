import { Module } from '@nestjs/common';
import { ResendModule } from '@/integrations/notifications/resend/resend.module';
import { CompanyController } from './controllers/company.controller';
import { TeamController } from './controllers/team.controller';
import { InvitationsController } from './controllers/invitations.controller';
import { CompaniesService } from './services/companies.service';
import { MembersService } from './services/members.service';
import { InvitationsService } from './services/invitations.service';

@Module({
  imports: [ResendModule],
  controllers: [CompanyController, TeamController, InvitationsController],
  providers: [CompaniesService, MembersService, InvitationsService],
  exports: [CompaniesService, MembersService, InvitationsService],
})
export class CompaniesModule {}
