import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ComplaintCategory, ComplaintStatus, ComplaintPriority } from '@prisma/client';

export class QueryComplaintsDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(ComplaintCategory)
  @IsOptional()
  category?: ComplaintCategory;

  @IsEnum(ComplaintStatus)
  @IsOptional()
  status?: ComplaintStatus;

  @IsEnum(ComplaintPriority)
  @IsOptional()
  priority?: ComplaintPriority;

  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  limit?: number = 20;
}
