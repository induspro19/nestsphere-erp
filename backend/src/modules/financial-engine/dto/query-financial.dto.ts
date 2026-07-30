import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { TransactionType } from '@prisma/client';

export class QueryFinancialDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(TransactionType)
  @IsOptional()
  txnType?: TransactionType;

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
  limit?: number = 20;
}
