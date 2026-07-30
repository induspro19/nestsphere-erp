import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ComplaintStatus, ComplaintPriority } from '@prisma/client';

export class UpdateComplaintDto {
  @IsEnum(ComplaintStatus)
  @IsOptional()
  status?: ComplaintStatus;

  @IsEnum(ComplaintPriority)
  @IsOptional()
  priority?: ComplaintPriority;

  @IsString()
  @IsOptional()
  assignedStaffId?: string;

  @IsString()
  @IsOptional()
  assignedVendorName?: string;

  @IsString()
  @IsOptional()
  resolutionNotes?: string;

  @IsString()
  @IsOptional()
  rootCause?: string;

  @IsString()
  @IsOptional()
  correctiveAction?: string;

  @IsString()
  @IsOptional()
  preventiveAction?: string;

  @IsNumber()
  @IsOptional()
  cost?: number;

  @IsNumber()
  @IsOptional()
  starRating?: number;

  @IsString()
  @IsOptional()
  residentFeedback?: string;
}
