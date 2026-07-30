import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdatePropertyConfigDto {
  @IsString()
  @IsOptional()
  blockLabel?: string; // Tower, Block, Building

  @IsBoolean()
  @IsOptional()
  hasWings?: boolean;

  @IsBoolean()
  @IsOptional()
  hasFloors?: boolean;

  @IsBoolean()
  @IsOptional()
  isSeparateParking?: boolean;

  @IsBoolean()
  @IsOptional()
  autoUnitNumbering?: boolean;

  @IsString()
  @IsOptional()
  unitNumberPattern?: string; // E.g., "{block}-{wing}-{unit}", "Tower-{block}-{unit}", "Shop-{unit}"
}
