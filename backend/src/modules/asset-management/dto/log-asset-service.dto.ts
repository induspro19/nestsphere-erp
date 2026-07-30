import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { AssetLogType } from '@prisma/client';

export class LogAssetServiceDto {
  @IsEnum(AssetLogType)
  @IsNotEmpty({ message: 'Log type is required' })
  logType: AssetLogType; // SERVICE, INSPECTION, CALIBRATION, BREAKDOWN, DEPRECIATION_UPDATE

  @IsString()
  @IsNotEmpty({ message: 'Log title is required' })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  cost?: number = 0;

  @IsString()
  @IsOptional()
  performedBy?: string;
}
