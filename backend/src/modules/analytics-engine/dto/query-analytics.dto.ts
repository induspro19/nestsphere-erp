import { IsOptional, IsString } from 'class-validator';

export class QueryAnalyticsDto {
  @IsString()
  @IsOptional()
  domain?: string;

  @IsString()
  @IsOptional()
  dateRange?: string = '30d'; // 7d, 30d, 90d, 1y
}
