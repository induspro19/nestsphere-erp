import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ParkingType } from '@prisma/client';

export class CreateParkingZoneDto {
  @IsEnum(ParkingType)
  parkingType: ParkingType;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  buildingId?: string;

  @IsString()
  @IsOptional()
  floor?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  totalSlots?: number;

  @IsString()
  @IsOptional()
  description?: string;
}
