import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { AmenityBookingStatus } from '@prisma/client';

export class UpdateBookingDto {
  @IsEnum(AmenityBookingStatus)
  @IsOptional()
  status?: AmenityBookingStatus;

  @IsString()
  @IsOptional()
  rejectionReason?: string;

  @IsString()
  @IsOptional()
  cancellationNote?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  damageCharges?: number;

  @IsString()
  @IsOptional()
  gatewayRef?: string;
}
