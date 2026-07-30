import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class QueryDocumentDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  folderId?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  entityType?: string;

  @IsString()
  @IsOptional()
  entityId?: string;

  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean = false;

  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  limit?: number = 20;
}
