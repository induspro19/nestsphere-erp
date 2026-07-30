import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  flatId: string;

  @IsString()
  @IsOptional()
  personId?: string;

  @IsString()
  vehicleNumber: string;

  @IsString()
  typeCode: string; // CAR, BIKE, EV_CAR, EV_BIKE, TRUCK, BUS, COMMERCIAL, EMERGENCY

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  modelName?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  stickerNumber?: string;

  @IsString()
  @IsOptional()
  rfidTag?: string;

  @IsString()
  @IsOptional()
  fasTag?: string;

  @IsDateString()
  @IsOptional()
  registrationDate?: string;

  @IsDateString()
  @IsOptional()
  insuranceExpiry?: string;

  @IsDateString()
  @IsOptional()
  pucExpiry?: string;

  @IsDateString()
  @IsOptional()
  fitnessExpiry?: string;

  @IsString()
  @IsOptional()
  rcDocUrl?: string;

  @IsString()
  @IsOptional()
  insuranceDocUrl?: string;

  @IsString()
  @IsOptional()
  photoUrl?: string;
}
