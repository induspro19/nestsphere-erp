import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { WorkOrderStatus, WorkOrderPriority } from '@prisma/client';

export class UpdateWorkOrderDto {
  @IsEnum(WorkOrderStatus)
  @IsOptional()
  status?: WorkOrderStatus;

  @IsEnum(WorkOrderPriority)
  @IsOptional()
  priority?: WorkOrderPriority;

  @IsString()
  @IsOptional()
  assignedStaffId?: string;

  @IsString()
  @IsOptional()
  assignedVendorName?: string;

  @IsNumber()
  @IsOptional()
  downtimeHours?: number;

  @IsNumber()
  @IsOptional()
  labourCost?: number;

  @IsNumber()
  @IsOptional()
  materialCost?: number;

  @IsString()
  @IsOptional()
  rootCause?: string;

  @IsString()
  @IsOptional()
  correctiveAction?: string;

  @IsString()
  @IsOptional()
  preventiveAction?: string;
}
