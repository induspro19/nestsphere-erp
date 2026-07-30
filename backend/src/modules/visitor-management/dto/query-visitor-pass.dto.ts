import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { VisitorTypeCategory, VisitorPassStatus } from '@prisma/client';

export class QueryVisitorPassDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(VisitorTypeCategory)
  @IsOptional()
  visitorType?: VisitorTypeCategory;

  @IsEnum(VisitorPassStatus)
  @IsOptional()
  status?: VisitorPassStatus;

  @IsString()
  @IsOptional()
  hostUnitId?: string;

  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  limit?: number = 20;
}
