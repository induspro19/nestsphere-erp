import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, IsDateString, Min, Max } from 'class-validator';
import { ActionItemPriority, ActionItemStatus } from '@prisma/client';

export class CreateActionItemDto {
  @IsString()
  @IsNotEmpty()
  task: string;

  @IsString()
  @IsOptional()
  ownerId?: string;

  @IsString()
  @IsOptional()
  ownerName?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsEnum(ActionItemPriority)
  @IsOptional()
  priority?: ActionItemPriority;

  @IsEnum(ActionItemStatus)
  @IsOptional()
  status?: ActionItemStatus;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  completionPercentage?: number;

  @IsString()
  @IsOptional()
  remarks?: string;
}
