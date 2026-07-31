import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CastElectionVoteDto {
  @ApiProperty()
  @IsString()
  positionId: string;

  @ApiProperty()
  @IsString()
  candidateId: string;

  @ApiProperty({ enum: ['APP', 'QR', 'WEB'], default: 'APP' })
  @IsString()
  source: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  proxyPersonId?: string;
}
