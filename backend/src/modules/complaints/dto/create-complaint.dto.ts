import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ComplaintCategory, ComplaintPriority } from '@prisma/client';

export class CreateComplaintDto {
  @IsEnum(ComplaintCategory)
  @IsNotEmpty({ message: 'Category is required' })
  category: ComplaintCategory;

  @IsEnum(ComplaintPriority)
  @IsOptional()
  priority?: ComplaintPriority = ComplaintPriority.MEDIUM;

  @IsString()
  @IsNotEmpty({ message: 'Subject is required' })
  subject: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @IsString()
  @IsOptional()
  unitId?: string;

  @IsString()
  @IsOptional()
  assetId?: string;

  @IsString()
  @IsOptional()
  reportedById?: string;

  @IsNumber()
  @IsOptional()
  slaHours?: number = 24;
}
