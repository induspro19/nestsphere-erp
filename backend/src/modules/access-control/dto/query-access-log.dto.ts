import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { AccessType, EntryMethod, AccessDirection } from '@prisma/client';

export class QueryAccessLogDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(AccessType)
  @IsOptional()
  accessType?: AccessType;

  @IsEnum(EntryMethod)
  @IsOptional()
  entryMethod?: EntryMethod;

  @IsEnum(AccessDirection)
  @IsOptional()
  direction?: AccessDirection;

  @IsBoolean()
  @IsOptional()
  isOverstay?: boolean;

  @IsString()
  @IsOptional()
  gateId?: string;

  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  limit?: number = 20;
}
