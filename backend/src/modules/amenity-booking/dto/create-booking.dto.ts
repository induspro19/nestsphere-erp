import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { AmenityBookingType, PaymentMethod } from '@prisma/client';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  amenityId: string;

  @IsString()
  @IsNotEmpty()
  personId: string;

  @IsEnum(AmenityBookingType)
  @IsOptional()
  bookingType?: AmenityBookingType;

  @IsDateString()
  bookingDate: string; // YYYY-MM-DD

  @IsString()
  startTime: string; // HH:MM

  @IsString()
  endTime: string; // HH:MM

  @IsNumber()
  @IsOptional()
  @Min(1)
  guestCount?: number;

  @IsString()
  @IsOptional()
  purposeNotes?: string;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @IsString()
  @IsOptional()
  gatewayRef?: string;
}
