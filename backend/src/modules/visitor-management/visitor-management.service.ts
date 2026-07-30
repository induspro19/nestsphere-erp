import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateVisitorPassDto } from './dto/create-visitor-pass.dto';
import { CheckInVisitorDto } from './dto/check-in-visitor.dto';
import { QueryVisitorPassDto } from './dto/query-visitor-pass.dto';
import { AccessControlService } from '../access-control/access-control.service';
import { NotificationsService } from '../notifications/notifications.service';
import { WorkflowEngineService } from '../workflow-engine/workflow-engine.service';
import { ActivityAction, AccessType } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class VisitorManagementService {
  constructor(
    private prisma: PrismaService,
    private accessControlService: AccessControlService,
    private notificationsService: NotificationsService,
    private workflowEngineService: WorkflowEngineService,
  ) {}

  // 1. Create / Pre-Approve Visitor Pass
  async createPass(societyId: string, dto: CreateVisitorPassDto, actorId: string) {
    // Check Blacklist Rule in Access Control Engine
    const isBlacklisted = await this.prisma.accessRule.findFirst({
      where: {
        societyId,
        ruleType: 'BLACKLIST',
        OR: [
          { entityValue: dto.visitorPhone },
          { entityValue: dto.vehicleNumber || '' },
        ],
      },
    });

    if (isBlacklisted) {
      throw new ForbiddenException(
        `VISITOR DENIED: Blacklisted entity (${isBlacklisted.entityValue}). Reason: ${isBlacklisted.reason || 'Security Restriction'}`,
      );
    }

    // Generate Pass Number (e.g. VIS-00001), QR Token, 6-Digit OTP
    const count = await this.prisma.visitorPass.count({ where: { societyId } });
    const passNumber = `VIS-${String(count + 1).padStart(5, '0')}`;
    const qrToken = `QR-VIS-${uuidv4()}`;
    const otpCode = String(Math.floor(100000 + Math.random() * 900000));

    // Map Person in People Engine if existing
    const existingPerson = await this.prisma.person.findFirst({
      where: { societyId, phone: dto.visitorPhone, isDeleted: false },
    });

    const isPreApproved = dto.passType === 'PRE_APPROVED' || dto.passType === 'SCHEDULED';
    const status = isPreApproved ? 'PRE_APPROVED' : 'CHECKED_IN';
    const now = new Date();

    const pass = await this.prisma.visitorPass.create({
      data: {
        societyId,
        passNumber,
        passType: dto.passType || 'INSTANT',
        visitorType: dto.visitorType,
        visitorName: dto.visitorName,
        visitorPhone: dto.visitorPhone,
        visitorEmail: dto.visitorEmail,
        personId: existingPerson ? existingPerson.id : null,
        hostPersonId: dto.hostPersonId || null,
        hostUnitId: dto.hostUnitId || null,
        purpose: dto.purpose,
        vehicleNumber: dto.vehicleNumber,
        expectedArrival: dto.expectedArrival ? new Date(dto.expectedArrival) : now,
        expectedExit: dto.expectedExit ? new Date(dto.expectedExit) : new Date(now.getTime() + 4 * 60 * 60 * 1000),
        actualArrival: isPreApproved ? null : now,
        qrToken,
        otpCode,
        photoUrl: dto.photoUrl,
        idProofUrl: dto.idProofUrl,
        status: status as any,
        createdBy: actorId,
      },
      include: {
        hostUnit: true,
        hostPerson: true,
      },
    });

    // Reuse Access Control Engine if Instant Check-In
    if (status === 'CHECKED_IN') {
      const accessLog = await this.accessControlService.logEntry(
        societyId,
        {
          gateId: 'default',
          accessType: this.mapVisitorTypeToAccessType(dto.visitorType),
          entryMethod: 'OTP',
          personId: existingPerson ? existingPerson.id : undefined,
          vehicleNumber: dto.vehicleNumber || undefined,
          photoUrl: dto.photoUrl || undefined,
          qrToken,
          otpToken: otpCode,
          remarks: `Visitor Pass: ${passNumber} (${dto.visitorName})`,
        },
        actorId,
      );

      await this.prisma.visitorPass.update({
        where: { id: pass.id },
        data: { accessLogId: accessLog.id },
      });
    }

    // Reuse Communication Engine: Dispatch Real-time Notification to Host Resident
    if (dto.hostPersonId) {
      await this.notificationsService.send(societyId, {
        channel: 'IN_APP',
        category: 'VISITOR',
        priority: 'HIGH',
        recipientId: dto.hostPersonId,
        title: `👋 Visitor ${isPreApproved ? 'Scheduled' : 'Arrived'}: ${dto.visitorName}`,
        message: `${dto.visitorName} (${dto.visitorType}) ${isPreApproved ? 'is pre-approved to visit' : 'has entered gate'} for unit ${pass.hostUnit?.flatNumber || ''}. Pass OTP: ${otpCode}`,
        metadata: { visitorPassId: pass.id, passNumber, otpCode },
      });
    }

    // Log Activity Timeline
    await this.prisma.activityTimeline.create({
      data: {
        societyId,
        entityType: 'VISITOR_PASS',
        entityId: pass.id,
        action: ActivityAction.CREATED,
        title: `Visitor Pass Generated (${passNumber})`,
        description: `Pass for ${dto.visitorName} (${dto.visitorType}) created by ${actorId}`,
        actorId,
      },
    });

    return pass;
  }

  // 2. Gate Check-In Visitor (OTP / QR Verification)
  async checkIn(societyId: string, dto: CheckInVisitorDto, guardId: string) {
    let pass = null;

    if (dto.passId) {
      pass = await this.prisma.visitorPass.findFirst({ where: { id: dto.passId, societyId } });
    } else if (dto.otpCode) {
      pass = await this.prisma.visitorPass.findFirst({ where: { otpCode: dto.otpCode, societyId } });
    } else if (dto.qrToken) {
      pass = await this.prisma.visitorPass.findFirst({ where: { qrToken: dto.qrToken, societyId } });
    }

    if (!pass) {
      throw new NotFoundException('Invalid or expired visitor pass credentials');
    }

    if (pass.status === 'CHECKED_IN') {
      throw new BadRequestException(`Visitor ${pass.visitorName} is already checked in`);
    }

    const now = new Date();

    // Call Access Control Engine
    const accessLog = await this.accessControlService.logEntry(
      societyId,
      {
        gateId: dto.gateId || 'default',
        accessType: this.mapVisitorTypeToAccessType(pass.visitorType),
        entryMethod: dto.qrToken ? 'QR_CODE' : 'OTP',
        personId: pass.personId || undefined,
        vehicleNumber: pass.vehicleNumber || undefined,
        photoUrl: pass.photoUrl || undefined,
        qrToken: pass.qrToken || undefined,
        otpToken: pass.otpCode || undefined,
        remarks: `Checked-In Visitor Pass ${pass.passNumber}`,
      },
      guardId,
    );

    const updatedPass = await this.prisma.visitorPass.update({
      where: { id: pass.id },
      data: {
        status: 'CHECKED_IN',
        actualArrival: now,
        accessLogId: accessLog.id,
      },
    });

    // Notify Host
    if (pass.hostPersonId) {
      await this.notificationsService.send(societyId, {
        channel: 'IN_APP',
        category: 'VISITOR',
        priority: 'HIGH',
        recipientId: pass.hostPersonId,
        title: `🚪 Gate Arrival: ${pass.visitorName}`,
        message: `${pass.visitorName} has just checked in at Main Gate.`,
        metadata: { visitorPassId: pass.id },
      });
    }

    return updatedPass;
  }

  // 3. Gate Check-Out Visitor
  async checkOut(societyId: string, passId: string, guardId: string) {
    const pass = await this.prisma.visitorPass.findFirst({
      where: { id: passId, societyId },
    });

    if (!pass) throw new NotFoundException('Visitor pass not found');

    const now = new Date();

    // Call Access Control Engine for Exit Processing
    if (pass.accessLogId) {
      try {
        await this.accessControlService.logExit(
          societyId,
          {
            gateId: 'default',
            accessLogId: pass.accessLogId,
          },
          guardId,
        );
      } catch {
        // Continue if access log already closed
      }
    }

    return this.prisma.visitorPass.update({
      where: { id: passId },
      data: {
        status: 'CHECKED_OUT',
        actualExit: now,
      },
    });
  }

  // 4. Query Visitor Passes & History
  async findAll(societyId: string, query: QueryVisitorPassDto) {
    const { search, visitorType, status, hostUnitId, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = { societyId, isDeleted: false };

    if (search) {
      where.OR = [
        { visitorName: { contains: search, mode: 'insensitive' } },
        { visitorPhone: { contains: search } },
        { passNumber: { contains: search, mode: 'insensitive' } },
        { vehicleNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (visitorType) where.visitorType = visitorType;
    if (status) where.status = status;
    if (hostUnitId) where.hostUnitId = hostUnitId;

    const [items, total] = await Promise.all([
      this.prisma.visitorPass.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          hostUnit: true,
          hostPerson: true,
          accessLog: true,
        },
      }),
      this.prisma.visitorPass.count({ where }),
    ]);

    return {
      data: items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // 5. Visitor Analytics (Daily, Monthly, Frequent Visitors)
  async getAnalytics(societyId: string) {
    const passes = await this.prisma.visitorPass.findMany({
      where: { societyId, isDeleted: false },
      select: { visitorType: true, status: true, actualArrival: true, visitorPhone: true, visitorName: true },
    });

    const totalCount = passes.length;
    const checkedInCount = passes.filter((p) => p.status === 'CHECKED_IN').length;

    const byType: Record<string, number> = {};
    const frequentMap: Record<string, { name: string; count: number }> = {};

    passes.forEach((p) => {
      byType[p.visitorType] = (byType[p.visitorType] || 0) + 1;
      if (p.visitorPhone) {
        if (!frequentMap[p.visitorPhone]) {
          frequentMap[p.visitorPhone] = { name: p.visitorName, count: 1 };
        } else {
          frequentMap[p.visitorPhone].count += 1;
        }
      }
    });

    const frequentVisitors = Object.entries(frequentMap)
      .map(([phone, data]) => ({ phone, name: data.name, visitCount: data.count }))
      .sort((a, b) => b.visitCount - a.visitCount)
      .slice(0, 5);

    return {
      totalCount,
      checkedInCount,
      byType,
      frequentVisitors,
    };
  }

  // Helper Mapper: Map VisitorType to AccessType
  private mapVisitorTypeToAccessType(vType: string): AccessType {
    switch (vType) {
      case 'VENDOR':
        return AccessType.VENDOR;
      case 'DELIVERY':
      case 'FOOD_DELIVERY':
      case 'COURIER':
        return AccessType.DELIVERY;
      case 'CAB_DRIVER':
        return AccessType.CAB;
      case 'POLICE':
        return AccessType.POLICE;
      case 'FIRE_BRIGADE':
        return AccessType.FIRE_BRIGADE;
      case 'AMBULANCE':
        return AccessType.AMBULANCE;
      default:
        return AccessType.GUEST;
    }
  }
}
