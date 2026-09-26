import { Module } from '@nestjs/common';
import { ResendModule } from '@/integrations/notifications/resend/resend.module';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';

@Module({
    imports: [ResendModule],
    controllers: [ContactController],
    providers: [ContactService],
})
export class ContactModule {}
