import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ParkingSlotStatus } from '@prisma/client';

export class QueryParkingDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  zoneId?: string;

  @IsEnum(ParkingSlotStatus)
  @IsOptional()
  slotStatus?: ParkingSlotStatus;

  @IsString()
  @IsOptional()
  slotSize?: string;

  @IsString()
  @IsOptional()
  allocationType?: string;

  @IsString()
  @IsOptional()
  allocationStatus?: string;

  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  limit?: number = 50;
}
