import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { RuleType } from '@prisma/client';

export class CreateAccessRuleDto {
  @IsEnum(RuleType)
  @IsNotEmpty()
  ruleType: RuleType; // WHITELIST, BLACKLIST

  @IsString()
  @IsNotEmpty()
  entityType: string; // PERSON, VEHICLE, PHONE

  @IsString()
  @IsNotEmpty()
  entityValue: string; // Phone number, Vehicle number, Person ID

  @IsString()
  @IsOptional()
  reason?: string;
}
