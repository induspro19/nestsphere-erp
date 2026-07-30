import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { QueryPersonDto } from './dto/query-person.dto';
import { ActivityAction } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PeopleManagementService {
  constructor(private prisma: PrismaService) {}

  // 1. Get Paginated People List with Filters
  async findAll(societyId: string, query: QueryPersonDto) {
    const { search, role, kycStatus, status, unitId, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      societyId,
      isDeleted: false,
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { digitalId: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.roles = {
        some: { roleCode: role },
      };
    }

    if (kycStatus) {
      where.kycStatus = kycStatus;
    }

    if (status) {
      where.status = status;
    }

    if (unitId) {
      where.unitMappings = {
        some: { unitId, occupancyStatus: 'ACTIVE' },
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.person.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          roles: true,
          unitMappings: {
            include: { unit: true },
          },
          vehicles: true,
        },
      }),
      this.prisma.person.count({ where }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 2. Get Single Person Profile
  async findOne(societyId: string, id: string) {
    const person = await this.prisma.person.findFirst({
      where: { id, societyId, isDeleted: false },
      include: {
        roles: true,
        unitMappings: {
          include: { unit: true },
        },
        vehicles: true,
      },
    });

    if (!person) {
      throw new NotFoundException('Person profile not found');
    }

    return person;
  }

  // 3. Create Master Person Record
  async create(societyId: string, dto: CreatePersonDto, actorId: string) {
    // Generate Digital ID (e.g. PRN-94820)
    const count = await this.prisma.person.count({ where: { societyId } });
    const digitalId = `PRN-${String(count + 1).padStart(5, '0')}`;
    const digitalIdQrToken = `QR-${uuidv4()}`;

    const person = await this.prisma.$transaction(async (tx) => {
      const created = await tx.person.create({
        data: {
          societyId,
          digitalId,
          digitalIdQrToken,
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          phone: dto.phone,
          gender: dto.gender || 'MALE',
          avatarUrl: dto.avatarUrl,
          identityType: dto.identityType,
          identityNumber: dto.identityNumber,
          kycStatus: dto.kycStatus || 'PENDING',
          status: dto.status || 'ACTIVE',
          emergencyContacts: dto.emergencyContacts || [],
          isAttendanceReady: dto.isAttendanceReady ?? true,
          isFaceRecognitionReady: dto.isFaceRecognitionReady ?? false,
          isMobileAppReady: dto.isMobileAppReady ?? false,
          isVisitorReady: dto.isVisitorReady ?? true,
          createdBy: actorId,
        },
      });

      // Create Role Mappings
      if (dto.roles && dto.roles.length > 0) {
        await tx.personRole.createMany({
          data: dto.roles.map((r) => ({
            personId: created.id,
            roleCode: r,
          })),
        });
      }

      // Create Unit Mappings
      if (dto.unitIds && dto.unitIds.length > 0) {
        await tx.personUnit.createMany({
          data: dto.unitIds.map((uId) => ({
            personId: created.id,
            unitId: uId,
            moveInDate: new Date(),
            occupancyStatus: 'ACTIVE',
          })),
        });
      }

      // Log Activity Timeline
      await tx.activityTimeline.create({
        data: {
          societyId,
          entityType: 'PERSON',
          entityId: created.id,
          action: ActivityAction.CREATED,
          title: `Person Profile Created (${digitalId})`,
          description: `${created.firstName} ${created.lastName} registered with roles ${dto.roles.join(', ')}`,
          actorId,
        },
      });

      return created;
    });

    return this.findOne(societyId, person.id);
  }

  // 4. Update Person Profile
  async update(societyId: string, id: string, dto: UpdatePersonDto, actorId: string) {
    const existing = await this.findOne(societyId, id);

    await this.prisma.$transaction(async (tx) => {
      await tx.person.update({
        where: { id },
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          phone: dto.phone,
          gender: dto.gender,
          avatarUrl: dto.avatarUrl,
          identityType: dto.identityType,
          identityNumber: dto.identityNumber,
          kycStatus: dto.kycStatus,
          status: dto.status,
          emergencyContacts: dto.emergencyContacts as any,
          isAttendanceReady: dto.isAttendanceReady,
          isFaceRecognitionReady: dto.isFaceRecognitionReady,
          isMobileAppReady: dto.isMobileAppReady,
          isVisitorReady: dto.isVisitorReady,
          updatedBy: actorId,
        },
      });

      // Update Roles if provided
      if (dto.roles) {
        await tx.personRole.deleteMany({ where: { personId: id } });
        await tx.personRole.createMany({
          data: dto.roles.map((r) => ({
            personId: id,
            roleCode: r,
          })),
        });
      }

      // Log Activity Timeline
      await tx.activityTimeline.create({
        data: {
          societyId,
          entityType: 'PERSON',
          entityId: id,
          action: ActivityAction.UPDATED,
          title: `Person Profile Updated (${existing.digitalId})`,
          description: `Updated details for ${existing.firstName} ${existing.lastName}`,
          actorId,
        },
      });
    });

    return this.findOne(societyId, id);
  }

  // 5. Process Move Out for Person
  async processMoveOut(societyId: string, id: string, unitId: string, actorId: string) {
    await this.findOne(societyId, id);

    await this.prisma.personUnit.updateMany({
      where: { personId: id, unitId },
      data: {
        occupancyStatus: 'MOVED_OUT',
        moveOutDate: new Date(),
      },
    });

    await this.prisma.activityTimeline.create({
      data: {
        societyId,
        entityType: 'PERSON',
        entityId: id,
        action: ActivityAction.UPDATED,
        title: `Person Moved Out`,
        description: `Process move out from unit ID ${unitId}`,
        actorId,
      },
    });

    return { message: 'Move out processed successfully' };
  }

  // 6. Bulk Import People
  async bulkImport(societyId: string, records: CreatePersonDto[], actorId: string) {
    let importedCount = 0;
    for (const record of records) {
      try {
        await this.create(societyId, record, actorId);
        importedCount++;
      } catch {
        // Skip failed record
      }
    }
    return { importedCount, totalProcessed: records.length };
  }

  // 7. Bulk Export People
  async bulkExport(societyId: string) {
    const people = await this.prisma.person.findMany({
      where: { societyId, isDeleted: false },
      include: {
        roles: true,
        unitMappings: { include: { unit: true } },
      },
    });

    return people.map((p) => ({
      DigitalID: p.digitalId,
      FirstName: p.firstName,
      LastName: p.lastName,
      Email: p.email || '',
      Phone: p.phone,
      Gender: p.gender,
      Roles: p.roles.map((r) => r.roleCode).join(', '),
      KYCStatus: p.kycStatus,
      Status: p.status,
      Units: p.unitMappings.map((u) => u.unit.code || u.unit.flatNumber).join(', '),
      CreatedAt: p.createdAt.toISOString(),
    }));
  }

  // 8. Soft Delete Person
  async remove(societyId: string, id: string, actorId: string) {
    const existing = await this.findOne(societyId, id);

    await this.prisma.person.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: actorId,
      },
    });

    await this.prisma.activityTimeline.create({
      data: {
        societyId,
        entityType: 'PERSON',
        entityId: id,
        action: ActivityAction.DELETED,
        title: `Person Soft-Deleted (${existing.digitalId})`,
        description: `Deleted profile of ${existing.firstName} ${existing.lastName}`,
        actorId,
      },
    });

    return { message: 'Person deleted successfully' };
  }
}
