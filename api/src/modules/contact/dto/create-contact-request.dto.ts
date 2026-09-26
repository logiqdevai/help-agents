import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, ArrayUnique, IsArray, IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import {
    ContactProductIds,
    ContactRequestTypeIds,
    type ContactProduct,
    type ContactRequestType,
} from '../contact.constants';

export class CreateContactRequestDto {
    @ApiProperty({ description: 'What the visitor wants', enum: ContactRequestTypeIds, example: 'demo' })
    @IsIn(ContactRequestTypeIds)
    request_type: ContactRequestType;

    @ApiProperty({ description: 'Full name', example: 'Maria Papadopoulou' })
    @IsString()
    @MinLength(1)
    @MaxLength(120)
    name: string;

    @ApiProperty({ description: 'Work email address', example: 'maria@company.com', format: 'email' })
    @IsEmail()
    @MaxLength(254)
    email: string;

    @ApiProperty({ description: 'Phone number', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(32)
    phone?: string;

    @ApiProperty({ description: 'Products the visitor wants information about', enum: ContactProductIds, isArray: true })
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(ContactProductIds.length)
    @ArrayUnique()
    @IsIn(ContactProductIds, { each: true })
    products: ContactProduct[];

    @ApiProperty({ description: 'What the visitor wants to automate, or their question', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(3000)
    message?: string;

    @ApiProperty({ description: 'Honeypot: real visitors leave this empty', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    website?: string;
}
