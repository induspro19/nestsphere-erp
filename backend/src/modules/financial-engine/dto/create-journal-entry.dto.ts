import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class JournalItemDto {
  @IsString()
  @IsNotEmpty({ message: 'Account ID is required' })
  accountId: string;

  @IsNumber()
  @IsOptional()
  debitAmount?: number = 0;

  @IsNumber()
  @IsOptional()
  creditAmount?: number = 0;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateJournalEntryDto {
  @IsString()
  @IsNotEmpty({ message: 'Narration is required' })
  narration: string;

  @IsString()
  @IsOptional()
  referenceNumber?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JournalItemDto)
  items: JournalItemDto[];
}
