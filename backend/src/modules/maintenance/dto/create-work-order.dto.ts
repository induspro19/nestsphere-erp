import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { WorkOrderType, WorkOrderPriority } from '@prisma/client';

export class CreateWorkOrderDto {
  @IsEnum(WorkOrderType)
  @IsOptional()
  type?: WorkOrderType = WorkOrderType.PREVENTIVE;

  @IsEnum(WorkOrderPriority)
  @IsOptional()
  priority?: WorkOrderPriority = WorkOrderPriority.MEDIUM;

  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @IsString()
  @IsNotEmpty({ message: 'Asset ID is required' })
  assetId: string;

  @IsString()
  @IsOptional()
  complaintId?: string;

  @IsString()
  @IsOptional()
  assignedStaffId?: string;

  @IsString()
  @IsOptional()
  assignedVendorName?: string;

  @IsDateString()
  @IsOptional()
  scheduledDate?: string;
}
