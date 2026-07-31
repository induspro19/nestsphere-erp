import { IsString, IsOptional } from 'class-validator';

export class QueryPollsDto {
  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  pollType?: string;

  @IsString()
  @IsOptional()
  search?: string;
}
