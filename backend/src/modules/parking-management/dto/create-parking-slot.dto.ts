import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ParkingSlotSize } from '@prisma/client';

export class CreateParkingSlotDto {
  @IsString()
  @IsNotEmpty()
  zoneId: string;

  @IsString()
  @IsNotEmpty()
  slotNumber: string;

  @IsEnum(ParkingSlotSize)
  @IsOptional()
  slotSize?: ParkingSlotSize;

  @IsString()
  @IsOptional()
  floor?: string;

  @IsString()
  @IsOptional()
  block?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsBoolean()
  @IsOptional()
  isEvEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  isRfidEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  isQrEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  isBoomBarrier?: boolean;

  @IsBoolean()
  @IsOptional()
  isDisabled?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  monthlyRate?: number;
}
