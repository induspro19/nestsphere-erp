import { IsString, IsNotEmpty, IsOptional, IsEmail, IsBoolean, IsNumber, IsEnum, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class ProvisionSocietyDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  societyTypeCode: string;

  @IsString()
  @IsNotEmpty()
  addressLine1: string;

  @IsString()
  @IsNotEmpty()
  pincode: string;

  @IsEmail()
  @IsNotEmpty()
  contactEmail: string;

  @IsString()
  @IsNotEmpty()
  contactPhone: string;

  @IsString()
  @IsNotEmpty()
  adminName: string;

  @IsEmail()
  @IsNotEmpty()
  adminEmail: string;

  @IsString()
  @IsNotEmpty()
  adminPhone: string;

  @IsString()
  @IsOptional()
  planId?: string;

  @IsBoolean()
  @IsOptional()
  createDefaultBuildings?: boolean;
}

export class UpdateSocietyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  addressLine1?: string;

  @IsString()
  @IsOptional()
  pincode?: string;

  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @IsString()
  @IsOptional()
  contactPhone?: string;

  @IsString()
  @IsOptional()
  status?: string;
}

export class SocietyQueryDto {
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  limit?: number = 10;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  sortBy?: string;

  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}

export class UpdateFeatureFlagDto {
  @IsString()
  @IsNotEmpty()
  module: string;

  @IsBoolean()
  @IsNotEmpty()
  enabled: boolean;
}

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;
}

export class UpdatePlanDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  price?: number;
}

export class CreateLicenseDto {
  @IsString()
  @IsNotEmpty()
  societyId: string;

  @IsString()
  @IsNotEmpty()
  planId: string;

  @IsNumber()
  @IsNotEmpty()
  durationMonths: number;
}

export class UpdateLicenseDto {
  @IsString()
  @IsOptional()
  status?: string;
}

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}

export class UpdateTicketDto {
  @IsString()
  @IsNotEmpty()
  status: string;
}

export class PlatformSettingsDto {
  @IsObject()
  @IsOptional()
  smtp?: Record<string, any>;

  @IsObject()
  @IsOptional()
  sms?: Record<string, any>;

  @IsObject()
  @IsOptional()
  whatsapp?: Record<string, any>;

  @IsObject()
  @IsOptional()
  security?: Record<string, any>;
}

export class PlatformUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  role: string;
}
