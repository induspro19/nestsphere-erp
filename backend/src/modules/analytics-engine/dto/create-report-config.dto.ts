import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateReportConfigDto {
  @IsString()
  @IsNotEmpty({ message: 'Report title is required' })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty({ message: 'Domain is required' })
  domain: string; // FINANCIAL, VISITOR, ASSET, PEOPLE, WORKFLOW, ACCESS, DOCUMENT, NOTIFICATION, AUDIT

  @IsString()
  @IsOptional()
  chartType?: string = 'BAR'; // KPI, BAR, LINE, PIE, DONUT, TABLE, PIVOT

  @IsBoolean()
  @IsOptional()
  isScheduled?: boolean = false;

  @IsString()
  @IsOptional()
  cronSchedule?: string;

  @IsArray()
  @IsOptional()
  recipients?: string[];
}
