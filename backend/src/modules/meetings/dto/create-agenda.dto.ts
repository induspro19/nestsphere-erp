import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

export class CreateAgendaDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  presenter?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  estimatedDuration?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  sequence?: number;
}
