import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { AssetStatus } from '@prisma/client';

export class CreateAssetDto {
  @IsString()
  @IsNotEmpty({ message: 'Category ID is required' })
  categoryId: string;

  @IsString()
  @IsNotEmpty({ message: 'Asset Name is required' })
  name: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  modelNumber?: string;

  @IsString()
  @IsOptional()
  serialNumber?: string;

  @IsString()
  @IsOptional()
  barcode?: string;

  @IsString()
  @IsOptional()
  rfidTag?: string;

  @IsString()
  @IsOptional()
  buildingId?: string;

  @IsString()
  @IsOptional()
  wingId?: string;

  @IsString()
  @IsOptional()
  locationDetails?: string;

  @IsDateString()
  @IsOptional()
  purchaseDate?: string;

  @IsDateString()
  @IsOptional()
  installationDate?: string;

  @IsDateString()
  @IsOptional()
  warrantyExpiry?: string;

  @IsDateString()
  @IsOptional()
  amcExpiry?: string;

  @IsString()
  @IsOptional()
  vendorName?: string;

  @IsString()
  @IsOptional()
  vendorPhone?: string;

  @IsNumber()
  @IsOptional()
  purchaseCost?: number;

  @IsNumber()
  @IsOptional()
  currentValue?: number;

  @IsNumber()
  @IsOptional()
  depreciationRate?: number;

  @IsNumber()
  @IsOptional()
  maintenanceIntervalDays?: number = 30;

  @IsString()
  @IsOptional()
  personResponsibleId?: string;

  @IsEnum(AssetStatus)
  @IsOptional()
  status?: AssetStatus = AssetStatus.OPERATIONAL;

  @IsArray()
  @IsOptional()
  photos?: string[];

  @IsArray()
  @IsOptional()
  documents?: string[];

  @IsArray()
  @IsOptional()
  spareParts?: { name: string; quantity: number; partNumber?: string }[];
}
