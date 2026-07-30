import { IsOptional, IsString } from 'class-validator';

export class GenerateBulkBillsDto {
  /** Billing period in YYYY-MM format, e.g. "2026-07". Defaults to current month. */
  @IsString()
  @IsOptional()
  billingMonth?: string;

  /** Optionally restrict bulk generation to a single building */
  @IsString()
  @IsOptional()
  buildingId?: string;
}
