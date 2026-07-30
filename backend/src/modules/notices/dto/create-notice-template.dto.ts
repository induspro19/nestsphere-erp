import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { NoticeCategory } from '@prisma/client';

export class CreateNoticeTemplateDto {
  @IsString()
  @IsNotEmpty()
  templateName: string;

  @IsEnum(NoticeCategory)
  category: NoticeCategory;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
