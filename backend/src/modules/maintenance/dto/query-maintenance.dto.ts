import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { WorkOrderType, WorkOrderStatus, WorkOrderPriority } from '@prisma/client';

export class QueryMaintenanceDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(WorkOrderType)
  @IsOptional()
  type?: WorkOrderType;

  @IsEnum(WorkOrderStatus)
  @IsOptional()
  status?: WorkOrderStatus;

  @IsEnum(WorkOrderPriority)
  @IsOptional()
  priority?: WorkOrderPriority;

  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  limit?: number = 20;
}
