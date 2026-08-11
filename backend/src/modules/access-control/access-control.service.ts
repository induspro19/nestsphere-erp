import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { LogEntryDto } from './dto/log-entry.dto';
import { LogExitDto } from './dto/log-exit.dto';
import { QueryAccessLogDto } from './dto/query-access-log.dto';
import { CreateAccessRuleDto } from './dto/create-access-rule.dto';
import { ActivityAction } from '@prisma/client';

@Injectable()
export class AccessControlService {
  constructor(private prisma: PrismaService) {}

  // 1. Log Entry Event
  async logEntry(societyId: string, dto: LogEntryDto, guardId?: string) {
    // Check for Blacklist Rules
    const isBlacklisted = await this.prisma.accessRule.findFirst({
      where: {
        societyId,
        ruleType: 'BLACKLIST',
        OR: [
          { entityValue: dto.vehicleNumber || '' },
          { entityValue: dto.personId || '' },
        ],
      },
    });

    if (isBlacklisted) {
      throw new ForbiddenException(
        `ACCESS DENIED: Blacklisted entity (${isBlacklisted.entityValue}). Reason: ${isBlacklisted.reason || 'Security Restriction'}`,
      );
    }

    // Ensure Gate exists or create default Main Gate
    let gate = null;
    if (dto.gateId && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(dto.gateId)) {
      gate = await this.prisma.gate.findFirst({
        where: { id: dto.gateId, societyId },
      });
    }

    if (!gate) {
      gate = await this.prisma.gate.findFirst({
        where: { societyId, code: 'GATE-001' },
      });

      if (!gate) {
        gate = await this.prisma.gate.create({
          data: {
            societyId,
            code: 'GATE-001',
            name: 'Main Gate',
            gateType: 'BI_DIRECTIONAL',
          },
        });
      }
    }

    const entryLog = await this.prisma.accessLog.create({
      data: {
        societyId,
        gateId: gate.id,
        personId: dto.personId || null,
        vehicleId: dto.vehicleId || null,
        accessType: dto.accessType,
        entryMethod: dto.entryMethod,
        direction: 'ENTRY',
        entryTime: new Date(),
        approvalSource: dto.approvalSource || 'SECURITY_GUARD',
        securityGuardId: guardId || null,
        vehicleNumber: dto.vehicleNumber || null,
        photoUrl: dto.photoUrl || null,
        qrToken: dto.qrToken || null,
        otpToken: dto.otpToken || null,
        remarks: dto.remarks || null,
      },
      include: {
        gate: true,
        person: true,
      },
    });

    // Log Activity Timeline
    await this.prisma.activityTimeline.create({
      data: {
        societyId,
        entityType: 'ACCESS_LOG',
        entityId: entryLog.id,
        action: ActivityAction.CREATED,
        title: `Gate Entry Logged (${dto.accessType})`,
        description: `Entry allowed. Access Type: ${dto.accessType}`,
        actorId: guardId!,
      },
    });

    return entryLog;
  }

  // 2. Log Exit Event
  async logExit(societyId: string, dto: LogExitDto, guardId?: string) {
    let logToUpdate = null;

    if (dto.accessLogId) {
      logToUpdate = await this.prisma.accessLog.findFirst({
        where: { id: dto.accessLogId, societyId, exitTime: null },
      });
    } else if (dto.vehicleNumber) {
      logToUpdate = await this.prisma.accessLog.findFirst({
        where: { societyId, vehicleNumber: dto.vehicleNumber, exitTime: null },
        orderBy: { entryTime: 'desc' },
      });
    } else if (dto.personId) {
      logToUpdate = await this.prisma.accessLog.findFirst({
        where: { societyId, personId: dto.personId, exitTime: null },
        orderBy: { entryTime: 'desc' },
      });
    }

    if (!logToUpdate) {
      throw new NotFoundException('Active inside entry record not found for exit processing');
    }

    const exitTime = new Date();
    const durationMinutes = Math.max(
      1,
      Math.floor((exitTime.getTime() - new Date(logToUpdate.entryTime).getTime()) / (1000 * 60)),
    );

    // Overstay threshold: > 240 minutes (4 hours) for temporary access types
    const isOverstay =
      durationMinutes > 240 &&
      !['RESIDENT', 'OWNER', 'TENANT', 'FAMILY_MEMBER'].includes(logToUpdate.accessType);

    const updatedLog = await this.prisma.accessLog.update({
      where: { id: logToUpdate.id },
      data: {
        exitTime,
        durationMinutes,
        isOverstay,
        remarks: dto.remarks || logToUpdate.remarks,
      },
      include: { gate: true, person: true },
    });

    // Log Activity Timeline
    await this.prisma.activityTimeline.create({
      data: {
        societyId,
        entityType: 'ACCESS_LOG',
        entityId: updatedLog.id,
        action: ActivityAction.UPDATED,
        title: `Gate Exit Logged (${logToUpdate.accessType})`,
        description: `Exit logged. Duration: ${durationMinutes} mins${isOverstay ? ' (OVERSTAY DETECTED)' : ''}`,
        actorId: guardId!,
      },
    });

    return updatedLog;
  }

  // 3. Live Occupancy & Inside Count
  async getLiveOccupancy(societyId: string) {
    const activeInsideLogs = await this.prisma.accessLog.findMany({
      where: {
        societyId,
        exitTime: null,
      },
      select: {
        accessType: true,
        entryTime: true,
        vehicleNumber: true,
      },
    });

    const totalInside = activeInsideLogs.length;

    const byType: Record<string, number> = {};
    activeInsideLogs.forEach((log) => {
      byType[log.accessType] = (byType[log.accessType] || 0) + 1;
    });

    const activeVehicles = activeInsideLogs.filter((l) => l.vehicleNumber).length;

    return {
      totalInside,
      activeVehicles,
      byType,
      timestamp: new Date().toISOString(),
    };
  }

  // 4. Overstay Alerts
  async getOverstayAlerts(societyId: string) {
    const activeInsideLogs = await this.prisma.accessLog.findMany({
      where: {
        societyId,
        exitTime: null,
      },
      include: {
        gate: true,
        person: true,
      },
    });

    const now = new Date();
    const overstayList = activeInsideLogs
      .map((log) => {
        const durationMinutes = Math.floor((now.getTime() - new Date(log.entryTime).getTime()) / (1000 * 60));
        return {
          ...log,
          currentDurationMinutes: durationMinutes,
          isOverstay: durationMinutes > 240 && !['RESIDENT', 'OWNER', 'TENANT', 'FAMILY_MEMBER'].includes(log.accessType),
        };
      })
      .filter((log) => log.isOverstay);

    return overstayList;
  }

  // 5. Emergency Override
  async emergencyOverride(societyId: string, emergencyType: 'POLICE' | 'FIRE_BRIGADE' | 'AMBULANCE' | 'EMERGENCY_SERVICE', guardId: string, remarks?: string) {
    let gate = await this.prisma.gate.findFirst({ where: { societyId } });
    if (!gate) {
      gate = await this.prisma.gate.create({
        data: { societyId, code: 'GATE-001', name: 'Main Gate', gateType: 'BI_DIRECTIONAL' },
      });
    }

    const log = await this.prisma.accessLog.create({
      data: {
        societyId,
        gateId: gate.id,
        accessType: emergencyType as any,
        entryMethod: 'EMERGENCY_OVERRIDE',
        direction: 'ENTRY',
        entryTime: new Date(),
        approvalSource: 'EMERGENCY',
        securityGuardId: guardId,
        remarks: remarks || `EMERGENCY OVERRIDE GRANTED FOR ${emergencyType}`,
      },
    });

    // Notify Security Log
    await this.prisma.notification.create({
      data: {
        societyId,
        userId: guardId,
        channel: 'IN_APP',
        title: `🚨 EMERGENCY OVERRIDE: ${emergencyType}`,
        message: `Emergency service ${emergencyType} entered through ${gate.name}`,
        metadata: { accessLogId: log.id, emergencyType },
      },
    });

    return log;
  }

  // 6. Access Logs Query & History
  async getAccessLogs(societyId: string, query: QueryAccessLogDto) {
    const { search, accessType, entryMethod, direction, isOverstay, gateId, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = { societyId };

    if (search) {
      where.OR = [
        { vehicleNumber: { contains: search, mode: 'insensitive' } },
        { remarks: { contains: search, mode: 'insensitive' } },
        { person: { firstName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (accessType) where.accessType = accessType;
    if (entryMethod) where.entryMethod = entryMethod;
    if (direction) where.direction = direction;
    if (typeof isOverstay === 'boolean') where.isOverstay = isOverstay;
    if (gateId) where.gateId = gateId;

    const [data, total] = await Promise.all([
      this.prisma.accessLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { entryTime: 'desc' },
        include: {
          gate: true,
          person: true,
        },
      }),
      this.prisma.accessLog.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // 7. Whitelist / Blacklist Access Rules
  async createAccessRule(societyId: string, dto: CreateAccessRuleDto, actorId: string) {
    return this.prisma.accessRule.upsert({
      where: {
        societyId_ruleType_entityType_entityValue: {
          societyId,
          ruleType: dto.ruleType,
          entityType: dto.entityType,
          entityValue: dto.entityValue,
        },
      },
      update: { reason: dto.reason },
      create: {
        societyId,
        ruleType: dto.ruleType,
        entityType: dto.entityType,
        entityValue: dto.entityValue,
        reason: dto.reason,
        createdBy: actorId,
      },
    });
  }

  async getAccessRules(societyId: string) {
    return this.prisma.accessRule.findMany({
      where: { societyId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
