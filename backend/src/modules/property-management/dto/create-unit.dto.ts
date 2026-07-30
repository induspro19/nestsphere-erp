import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { UnitType } from '@prisma/client';

export class CreateUnitDto {
  @IsString()
  @IsNotEmpty()
  buildingId: string;

  @IsString()
  @IsOptional()
  wingId?: string;

  @IsString()
  @IsOptional()
  floorId?: string;

  @IsString()
  @IsNotEmpty()
  flatNumber: string; // E.g., "101", "G15", "Villa-12"

  @IsEnum(UnitType)
  @IsOptional()
  unitType?: UnitType; // APARTMENT, VILLA, ROW_HOUSE, OFFICE, SHOP, WAREHOUSE, PENTHOUSE, STUDIO, DUPLEX, PARKING_UNIT, STORAGE_UNIT

  @IsNumber()
  @IsOptional()
  sqFt?: number;

  @IsString()
  @IsOptional()
  intercomNumber?: string;
}
