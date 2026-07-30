import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateWidgetDto {
  @IsString()
  @IsNotEmpty({ message: 'Widget title is required' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Widget type is required' })
  widgetType: string; // KPI_CARD, LINE_CHART, BAR_CHART, PIE_CHART, DATA_TABLE

  @IsString()
  @IsNotEmpty({ message: 'Domain is required' })
  domain: string;
}
