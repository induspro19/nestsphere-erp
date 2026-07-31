import { IsString, IsOptional, IsInt, IsBoolean, IsArray, ValidateNested, IsDateString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ElectionPositionDto {
  @ApiProperty({ example: 'CHAIRPERSON' })
  @IsString()
  positionTitle: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  seats: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateElectionDto {
  @ApiProperty({ example: '2026 AGM Committee Election' })
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ['AGM_COMMITTEE', 'SGM_COMMITTEE', 'BY_ELECTION'] })
  @IsString()
  electionType: string;

  @ApiProperty({ type: [ElectionPositionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ElectionPositionDto)
  positions: ElectionPositionDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  nominationStartDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  nominationEndDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  scrutinyEndDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  withdrawalEndDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  campaignStartDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  campaignEndDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  votingStartDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  votingEndDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  resultDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  appealEndDate?: string;

  @ApiProperty({ example: 50 })
  @IsInt()
  @Min(0)
  @Max(100)
  quorumPercentage: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  isSecretBallot: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  allowProxy: boolean;

  @ApiProperty({ example: 'ONE_VOTE_PER_FLAT' })
  @IsString()
  votingRule: string;
}
