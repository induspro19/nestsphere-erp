import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings(societyId: string, domain?: string) {
    const whereClause: any = { societyId };
    if (domain) {
      whereClause.domain = domain;
    }

    return this.prisma.setting.findMany({
      where: whereClause,
      select: {
        id: true,
        domain: true,
        key: true,
        value: true,
        updatedAt: true,
      },
    });
  }

  async upsertSetting(societyId: string, dto: UpdateSettingDto) {
    return this.prisma.setting.upsert({
      where: {
        societyId_domain_key: {
          societyId,
          domain: dto.domain,
          key: dto.key,
        },
      },
      update: {
        value: dto.value,
      },
      create: {
        societyId,
        domain: dto.domain,
        key: dto.key,
        value: dto.value,
      },
    });
  }
}
