import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { AmenityBookingType } from '@prisma/client';

export class CreateAmenityDto {
  @IsString()
  categoryCode: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  buildingId?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  capacity?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  hourlyRate?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  dailyRate?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  securityDeposit?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  cancellationFee?: number;

  @IsString()
  @IsOptional()
  openTime?: string;

  @IsString()
  @IsOptional()
  closeTime?: string;

  @IsBoolean()
  @IsOptional()
  requiresApproval?: boolean;

  @IsNumber()
  @IsOptional()
  maxBookingHours?: number;

  @IsNumber()
  @IsOptional()
  maxAdvanceBookDays?: number;

  @IsString()
  @IsOptional()
  amenityRules?: string;
}
