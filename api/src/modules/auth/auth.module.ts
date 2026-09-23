import { Logger, Module } from '@nestjs/common';
import { EmailAuthService } from './services/email.service';
import { EmailAuthController } from './controllers/email.controller';
import { PasswordService } from './services/password.service';
import { PasswordController } from './controllers/password.controller';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { CreateJwtServiceModule } from '@/shared/utils/jwt/jwt.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ResendModule } from '@/integrations/notifications/resend/resend.module';
import { AuthSessionService } from './services/auth-session.service';
import { EmailVerificationService } from './services/email-verification.service';
import { ProfileService } from './services/profile.service';
import { VerificationController } from './controllers/verification.controller';
import { ProfileController } from './controllers/profile.controller';

@Module({
  imports: [
    PrismaModule,
    CreateJwtServiceModule,
    ResendModule,
  ],
  providers: [
    EmailAuthService,
    PasswordService,
    AuthSessionService,
    EmailVerificationService,
    ProfileService,
    JwtStrategy,
    Logger,
  ],
  controllers: [EmailAuthController, PasswordController, VerificationController, ProfileController],
})
export class AuthModule { }
