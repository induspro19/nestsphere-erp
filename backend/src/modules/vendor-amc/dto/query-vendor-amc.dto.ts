import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class QueryVendorAmcDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  typeCode?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  vendorId?: string;

  @IsString()
  @IsOptional()
  contractType?: string;

  @IsString()
  @IsOptional()
  contractStatus?: string;

  @IsString()
  @IsOptional()
  visitType?: string;

  @IsString()
  @IsOptional()
  visitStatus?: string;

  /** upcoming renewals within N days */
  @IsNumber()
  @IsOptional()
  renewalDays?: number;

  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  limit?: number = 25;
}
