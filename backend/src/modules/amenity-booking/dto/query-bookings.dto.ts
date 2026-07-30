import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { AmenityBookingStatus } from '@prisma/client';

export class QueryBookingsDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  amenityId?: string;

  @IsString()
  @IsOptional()
  categoryCode?: string;

  @IsString()
  @IsOptional()
  bookingDate?: string; // YYYY-MM-DD

  /** YYYY-MM for monthly calendar view */
  @IsString()
  @IsOptional()
  month?: string;

  @IsEnum(AmenityBookingStatus)
  @IsOptional()
  status?: AmenityBookingStatus;

  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  limit?: number = 25;
}
