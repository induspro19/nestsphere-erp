import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, IsEnum, Min } from 'class-validator';
import { ResolutionStatus } from '@prisma/client';

export class CreateResolutionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(ResolutionStatus)
  @IsOptional()
  status?: ResolutionStatus;

  @IsBoolean()
  @IsOptional()
  votingRequired?: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  votesFor?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  votesAgainst?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  abstained?: number;

  @IsString()
  @IsOptional()
  remarks?: string;
}
