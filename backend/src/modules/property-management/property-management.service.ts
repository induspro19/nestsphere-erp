import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UpdatePropertyConfigDto } from './dto/update-property-config.dto';
import { CreateBlockDto } from './dto/create-block.dto';
import { CreateUnitDto } from './dto/create-unit.dto';

@Injectable()
export class PropertyManagementService {
  constructor(private prisma: PrismaService) {}

  // 1. Get or Initialize Property Settings
  async getPropertyConfig(societyId: string) {
    let config = await this.prisma.propertyConfig.findUnique({
      where: { societyId },
    });

    if (!config) {
      config = await this.prisma.propertyConfig.create({
        data: {
          societyId,
          blockLabel: 'Tower',
          hasWings: true,
          hasFloors: true,
          isSeparateParking: true,
          autoUnitNumbering: true,
          unitNumberPattern: '{block}-{wing}-{unit}',
        },
      });
    }

    return config;
  }

  // 2. Update Property Settings
  async updatePropertyConfig(societyId: string, dto: UpdatePropertyConfigDto) {
    return this.prisma.propertyConfig.upsert({
      where: { societyId },
      update: dto,
      create: {
        societyId,
        blockLabel: dto.blockLabel || 'Tower',
        hasWings: dto.hasWings ?? true,
        hasFloors: dto.hasFloors ?? true,
        isSeparateParking: dto.isSeparateParking ?? true,
        autoUnitNumbering: dto.autoUnitNumbering ?? true,
        unitNumberPattern: dto.unitNumberPattern || '{block}-{wing}-{unit}',
      },
    });
  }

  // 3. Create Block / Tower / Building
  async createBlock(societyId: string, dto: CreateBlockDto) {
    const code = dto.code || `BLD-${Date.now().toString().slice(-5)}`;
    return this.prisma.building.create({
      data: {
        societyId,
        name: dto.name,
        code,
        typeCode: dto.typeCode,
      },
    });
  }

  // 4. List Property Hierarchy
  async getPropertyHierarchy(societyId: string) {
    const config = await this.getPropertyConfig(societyId);

    const blocks = await this.prisma.building.findMany({
      where: { societyId, isDeleted: false },
      include: {
        wings: {
          where: { isDeleted: false },
          include: {
            floors: {
              where: { isDeleted: false },
              include: {
                flats: {
                  where: { isDeleted: false },
                },
              },
            },
          },
        },
        flats: {
          where: { isDeleted: false },
        },
      },
    });

    return {
      config,
      blocks,
    };
  }

  // 5. Create Unit (Flat, Villa, Shop, Office, etc.) with Numbering Engine
  async createUnit(societyId: string, dto: CreateUnitDto) {
    const config = await this.getPropertyConfig(societyId);

    const block = await this.prisma.building.findFirst({
      where: { id: dto.buildingId, societyId, isDeleted: false },
    });

    if (!block) {
      throw new NotFoundException('Block/Tower not found');
    }

    let unitCode = dto.flatNumber;

    if (config.autoUnitNumbering) {
      // Apply Numbering Pattern format, e.g. "Tower-A-101", "Villa-12", "Office-302", "Shop-G15"
      unitCode = config.unitNumberPattern
        .replace('{block}', block.name.replace(/\s+/g, ''))
        .replace('{wing}', dto.wingId ? 'W' : '')
        .replace('{unitType}', dto.unitType || 'Unit')
        .replace('{unit}', dto.flatNumber);
    }

    return this.prisma.flat.create({
      data: {
        societyId,
        buildingId: dto.buildingId,
        wingId: dto.wingId || null,
        floorId: dto.floorId || null,
        code: unitCode,
        flatNumber: dto.flatNumber,
        unitType: dto.unitType || 'APARTMENT',
        sqFt: dto.sqFt,
        intercomNumber: dto.intercomNumber,
      },
    });
  }
}
