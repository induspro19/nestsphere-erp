import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBlockDto {
  @IsString()
  @IsNotEmpty()
  name: string; // E.g. "Tower A", "Villa Complex 1", "Commercial Block"

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  typeCode?: string;
}
