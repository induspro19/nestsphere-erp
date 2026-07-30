import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { AmcContractType } from '@prisma/client';

export class CreateAmcDto {
  @IsString()
  @IsNotEmpty()
  vendorId: string;

  @IsEnum(AmcContractType)
  contractType: AmcContractType;

  @IsString()
  @IsOptional()
  contractNumber?: string;

  @IsString()
  @IsNotEmpty()
  startDate: string; // ISO date

  @IsString()
  @IsNotEmpty()
  endDate: string; // ISO date

  @IsNumber()
  @IsOptional()
  @Min(0)
  contractValue?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  amcCostPerMonth?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  penaltyPerHour?: number;

  @IsNumber()
  @IsOptional()
  slaResponseHours?: number;

  @IsNumber()
  @IsOptional()
  slaResolutionHours?: number;

  @IsString()
  @IsOptional()
  visitFrequency?: string; // MONTHLY, QUARTERLY, ANNUAL, AS_NEEDED

  @IsNumber()
  @IsOptional()
  renewalReminderDays?: number;

  @IsBoolean()
  @IsOptional()
  autoRenew?: boolean;

  @IsString()
  @IsOptional()
  insuranceNumber?: string;

  @IsString()
  @IsOptional()
  insuranceExpiry?: string;

  @IsString()
  @IsOptional()
  warrantyDetails?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  terms?: string;

  /** Array of assetIds to link to this AMC */
  @IsOptional()
  assetIds?: string[];
}
