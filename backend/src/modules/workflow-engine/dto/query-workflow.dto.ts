import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApprovalStatus } from '@prisma/client';

export class QueryWorkflowDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  entityType?: string;

  @IsEnum(ApprovalStatus)
  @IsOptional()
  status?: ApprovalStatus;

  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  limit?: number = 20;
}
