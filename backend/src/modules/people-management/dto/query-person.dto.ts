import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { PersonRoleCategory, KycStatus, AccountStatus } from '@prisma/client';

export class QueryPersonDto {
  @IsString()
  @IsOptional()
  search?: string; // Name, Phone, Digital ID, Email

  @IsEnum(PersonRoleCategory)
  @IsOptional()
  role?: PersonRoleCategory;

  @IsEnum(KycStatus)
  @IsOptional()
  kycStatus?: KycStatus;

  @IsEnum(AccountStatus)
  @IsOptional()
  status?: AccountStatus;

  @IsString()
  @IsOptional()
  unitId?: string;

  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  limit?: number = 20;
}
