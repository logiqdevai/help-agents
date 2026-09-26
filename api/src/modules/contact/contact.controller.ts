import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { CreateContactRequestDto } from './dto/create-contact-request.dto';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
    constructor(private readonly contactService: ContactService) {}

    @Post()
    @HttpCode(200)
    @ApiOperation({ summary: 'Send a contact / demo request from the marketing site to the sales inbox' })
    @ApiBody({ type: CreateContactRequestDto })
    @ApiResponse({ status: 200, description: 'Request sent' })
    @ApiResponse({ status: 400, description: 'Invalid request' })
    @ApiResponse({ status: 500, description: 'The email could not be sent' })
    create(@Body() dto: CreateContactRequestDto) {
        return this.contactService.create(dto);
    }
}
