import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class UpdateSettingDto {
  @IsString()
  @IsNotEmpty()
  domain: string; // SOCIETY, BILLING, NOTIFICATION, SECURITY, PAYMENT, VISITOR, COMPLAINT, LANGUAGE, THEME, BACKUP

  @IsString()
  @IsNotEmpty()
  key: string;

  @IsObject()
  @IsNotEmpty()
  value: any;
}
