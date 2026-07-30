import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { BillingCycle } from '@prisma/client';

export class CreateBillConfigDto {
  @IsEnum(BillingCycle)
  @IsOptional()
  billingCycle?: BillingCycle;

  @IsNumber()
  @IsOptional()
  @Min(0)
  baseSqFtRate?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  flatRatePerUnit?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  sinkingFundAmount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  corpusFundAmount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  parkingCharge2Wheeler?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  parkingCharge4Wheeler?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  waterCharge?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  electricityCharge?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  lateFeePercentage?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  dueDateDays?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  gstPercentage?: number;
}
