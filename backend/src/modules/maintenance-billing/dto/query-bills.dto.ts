import { IsNumber, IsOptional, IsString } from 'class-validator';

export class QueryBillsDto {
  @IsString()
  @IsOptional()
  search?: string;

  /** YYYY-MM format, e.g. "2026-07" */
  @IsString()
  @IsOptional()
  billingMonth?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  unitId?: string;

  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  limit?: number = 25;
}
