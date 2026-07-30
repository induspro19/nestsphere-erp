import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { FinancialAccountType } from '@prisma/client';

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty({ message: 'Account code is required' })
  accountCode: string; // e.g. 1000-CASH, 4000-MAINTENANCE

  @IsString()
  @IsNotEmpty({ message: 'Account name is required' })
  accountName: string;

  @IsEnum(FinancialAccountType)
  @IsNotEmpty({ message: 'Account type is required' })
  type: FinancialAccountType; // ASSET, LIABILITY, EQUITY, INCOME, EXPENSE

  @IsNumber()
  @IsOptional()
  balance?: number = 0;
}
