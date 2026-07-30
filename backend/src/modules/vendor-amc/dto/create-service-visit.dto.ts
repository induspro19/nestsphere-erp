import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ServiceVisitType } from '@prisma/client';

export class CreateServiceVisitDto {
  @IsString()
  @IsNotEmpty()
  vendorId: string;

  @IsString()
  @IsOptional()
  amcId?: string;

  @IsEnum(ServiceVisitType)
  visitType: ServiceVisitType;

  @IsString()
  @IsNotEmpty()
  scheduledDate: string; // ISO date

  @IsString()
  @IsOptional()
  technicianName?: string;

  @IsString()
  @IsOptional()
  technicianPhone?: string;

  @IsString()
  @IsOptional()
  workDescription?: string;

  @IsOptional()
  checklist?: { item: string; completed: boolean }[];
}

export class UpdateServiceVisitDto {
  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  actualDate?: string;

  @IsString()
  @IsOptional()
  technicalNotes?: string;

  @IsOptional()
  checklist?: { item: string; completed: boolean }[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  labourCost?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  materialCost?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  penaltyAmount?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @IsOptional()
  residentRating?: number;

  @IsString()
  @IsOptional()
  residentFeedback?: string;

  @IsString()
  @IsOptional()
  signatureUrl?: string;
}
