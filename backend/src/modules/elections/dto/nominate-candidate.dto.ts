import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NominateCandidateDto {
  @ApiProperty()
  @IsString()
  positionId: string;

  @ApiProperty()
  @IsString()
  candidatePersonId: string;

  @ApiProperty()
  @IsString()
  candidateName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  manifesto?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  manifestoPdfUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiProperty({ enum: ['SELF', 'ADMIN_NOMINATED'], default: 'SELF' })
  @IsString()
  nominationType: string;
}
