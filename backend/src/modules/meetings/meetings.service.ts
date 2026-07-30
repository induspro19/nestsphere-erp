import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { CreateAgendaDto } from './dto/create-agenda.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';
import { CreateResolutionDto } from './dto/create-resolution.dto';
import { CreateActionItemDto } from './dto/create-action-item.dto';
import { MeetingQueryDto } from './dto/meeting-query.dto';
import { ActivityAction } from '@prisma/client';

@Injectable()
export class MeetingsService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Executive Dashboard KPIs
  async getMetrics(societyId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [
      upcomingMeetings,
      meetingsThisMonth,
      meetingsHeldThisYear,
      allParticipants,
      openActionItems,
      overdueActionItems,
      allResolutions,
    ] = await Promise.all([
      this.prisma.meeting.count({
        where: { societyId, isDeleted: false, meetingStatus: { in: ['SCHEDULED', 'ONGOING'] } },
      }),
      this.prisma.meeting.count({
        where: { societyId, isDeleted: false, meetingDate: { gte: startOfMonth } },
      }),
      this.prisma.meeting.count({
        where: { societyId, isDeleted: false, meetingStatus: 'COMPLETED', meetingDate: { gte: startOfYear } },
      }),
      this.prisma.meetingParticipant.findMany({
        where: { meeting: { societyId, isDeleted: false } },
        select: { attendanceStatus: true },
      }),
      this.prisma.meetingActionItem.count({
        where: { meeting: { societyId, isDeleted: false }, status: { in: ['OPEN', 'IN_PROGRESS'] }, isDeleted: false },
      }),
      this.prisma.meetingActionItem.count({
        where: {
          meeting: { societyId, isDeleted: false },
          status: { in: ['OPEN', 'IN_PROGRESS'] },
          dueDate: { lt: now },
          isDeleted: false,
        },
      }),
      this.prisma.meetingResolution.findMany({
        where: { meeting: { societyId, isDeleted: false }, isDeleted: false },
        select: { status: true },
      }),
    ]);

    const totalParticipants = allParticipants.length;
    const presentParticipants = allParticipants.filter((p: any) => p.attendanceStatus === 'PRESENT' || p.attendanceStatus === 'LATE').length;
    const averageAttendancePercentage = totalParticipants > 0 ? Math.round((presentParticipants / totalParticipants) * 100) : 0;

    const totalResolutions = allResolutions.length;
    const passedResolutions = allResolutions.filter((r: any) => r.status === 'APPROVED').length;
    const resolutionPassRate = totalResolutions > 0 ? Math.round((passedResolutions / totalResolutions) * 100) : 0;

    return {
      upcomingMeetings,
      meetingsThisMonth,
      meetingsHeldThisYear,
      averageAttendancePercentage,
      openActionItems,
      overdueActionItems,
      resolutionPassRate,
    };
  }

  // 2. Search, Filter, Pagination
  async findAll(societyId: string, query: MeetingQueryDto) {
    const { meetingType, meetingStatus, search, date, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      societyId,
      isDeleted: false,
      ...(meetingType ? { meetingType } : {}),
      ...(meetingStatus ? { meetingStatus } : {}),
      ...(date ? { meetingDate: new Date(date) } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { meetingNumber: { contains: search, mode: 'insensitive' } },
              { venue: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.meeting.findMany({
        where,
        skip,
        take: limit,
        orderBy: { meetingDate: 'desc' },
        include: {
          chairPerson: { select: { id: true, firstName: true, lastName: true, email: true } },
          secretary: { select: { id: true, firstName: true, lastName: true, email: true } },
          _count: {
            select: {
              agendas: true,
              participants: true,
              resolutions: true,
              actionItems: true,
            },
          },
        },
      }),
      this.prisma.meeting.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 3. Meeting Details
  async findOne(societyId: string, id: string) {
    const meeting = await this.prisma.meeting.findFirst({
      where: { id, societyId, isDeleted: false },
      include: {
        chairPerson: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        secretary: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        agendas: { where: { isDeleted: false }, orderBy: { sequence: 'asc' } },
        participants: {
          include: {
            person: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
          },
          orderBy: { role: 'asc' },
        },
        resolutions: { where: { isDeleted: false }, orderBy: { createdAt: 'desc' } },
        actionItems: {
          where: { isDeleted: false },
          include: { owner: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: { dueDate: 'asc' },
        },
      },
    });

    if (!meeting) throw new NotFoundException('Meeting record not found');
    return meeting;
  }

    // 4. Create Meeting (MTG-00001 Auto Number)
  async create(societyId: string, dto: CreateMeetingDto, actorId: string) {
    const count = await this.prisma.meeting.count({ where: { societyId } });
    const meetingNumber = `MTG-${String(count + 1).padStart(5, '0')}`;

    const meeting = await this.prisma.meeting.create({
      data: {
        societyId,
        meetingNumber,
        title: dto.title,
        meetingType: dto.meetingType,
        meetingMode: dto.meetingMode || 'PHYSICAL',
        meetingStatus: 'SCHEDULED',
        description: dto.description || '',
        meetingDate: new Date(dto.meetingDate),
        startTime: dto.startTime,
        endTime: dto.endTime,
        venue: dto.venue || '',
        meetingUrl: dto.meetingUrl || dto.meetingLink || '',
        meetingLink: dto.meetingLink || dto.meetingUrl || '',
        meetingPlatform: dto.meetingPlatform || 'Google Meet',
        meetingPassword: dto.meetingPassword || '',
        isRecurring: dto.isRecurring || false,
        recurrenceType: dto.recurrenceType || 'NONE',
        recurrenceEndDate: dto.recurrenceEndDate ? new Date(dto.recurrenceEndDate) : null,
        chairPersonId: dto.chairPersonId || null,
        secretaryId: dto.secretaryId || null,
        requiresApproval: dto.requiresApproval || false,
        requiredQuorum: dto.requiredQuorum || 5,
        createdBy: actorId,
      },
    });

    // Record Activity Timeline
    await this.prisma.activityTimeline.create({
      data: {
        societyId,
        entityType: 'MEETING',
        entityId: meeting.id,
        action: ActivityAction.CREATED,
        title: `Meeting Scheduled (${meeting.meetingNumber})`,
        description: `${dto.meetingType} meeting titled "${dto.title}" scheduled for ${dto.meetingDate}.`,
        actorId,
      },
    });

    // Dispatch Notification
    await this.prisma.notification.create({
      data: {
        societyId,
        userId: actorId,
        title: `New Meeting Scheduled: ${dto.title}`,
        message: `A ${dto.meetingType} meeting (${meetingNumber}) has been scheduled on ${dto.meetingDate} at ${dto.startTime}.`,
        category: 'INFORMATION',
        channel: 'IN_APP',
      },
    });

    return meeting;
  }

  // 11. Meeting Templates
  async getTemplates(societyId: string) {
    return this.prisma.meetingTemplate.findMany({
      where: { societyId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTemplate(societyId: string, dto: any) {
    return this.prisma.meetingTemplate.create({
      data: {
        societyId,
        name: dto.name,
        meetingType: dto.meetingType,
        defaultAgenda: dto.defaultAgenda || [],
        estimatedDuration: dto.estimatedDuration || 60,
      },
    });
  }

  // 5. Update Meeting
  async update(societyId: string, id: string, dto: UpdateMeetingDto, actorId: string) {
    const existing = await this.prisma.meeting.findFirst({ where: { id, societyId, isDeleted: false } });
    if (!existing) throw new NotFoundException('Meeting not found');

    const updated = await this.prisma.meeting.update({
      where: { id },
      data: {
        ...(dto.title ? { title: dto.title } : {}),
        ...(dto.meetingType ? { meetingType: dto.meetingType } : {}),
        ...(dto.meetingMode ? { meetingMode: dto.meetingMode } : {}),
        ...(dto.meetingStatus ? { meetingStatus: dto.meetingStatus } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.meetingDate ? { meetingDate: new Date(dto.meetingDate) } : {}),
        ...(dto.startTime ? { startTime: dto.startTime } : {}),
        ...(dto.endTime ? { endTime: dto.endTime } : {}),
        ...(dto.venue !== undefined ? { venue: dto.venue } : {}),
        ...(dto.meetingUrl !== undefined ? { meetingUrl: dto.meetingUrl } : {}),
        ...(dto.chairPersonId !== undefined ? { chairPersonId: dto.chairPersonId } : {}),
        ...(dto.secretaryId !== undefined ? { secretaryId: dto.secretaryId } : {}),
        ...(dto.requiresApproval !== undefined ? { requiresApproval: dto.requiresApproval } : {}),
        ...(dto.requiredQuorum !== undefined ? { requiredQuorum: dto.requiredQuorum } : {}),
        ...(dto.minutesPrepared !== undefined ? { minutesPrepared: dto.minutesPrepared } : {}),
        ...(dto.minutesApproved !== undefined ? { minutesApproved: dto.minutesApproved } : {}),
        ...(dto.minutesNotes !== undefined ? { minutesNotes: dto.minutesNotes } : {}),
        updatedBy: actorId,
      },
    });

    // Record Activity Timeline
    await this.prisma.activityTimeline.create({
      data: {
        societyId,
        entityType: 'MEETING',
        entityId: id,
        action: ActivityAction.UPDATED,
        title: `Meeting Updated (${existing.meetingNumber})`,
        description: `Meeting details or status updated to ${updated.meetingStatus}.`,
        actorId,
      },
    });

    return updated;
  }

  // 6. Soft Delete Meeting
  async remove(societyId: string, id: string, actorId: string) {
    const existing = await this.prisma.meeting.findFirst({ where: { id, societyId, isDeleted: false } });
    if (!existing) throw new NotFoundException('Meeting not found');

    const deleted = await this.prisma.meeting.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        meetingStatus: 'CANCELLED',
        updatedBy: actorId,
      },
    });

    return deleted;
  }

  // 7. Add Agenda
  async addAgenda(societyId: string, meetingId: string, dto: CreateAgendaDto) {
    const meeting = await this.prisma.meeting.findFirst({ where: { id: meetingId, societyId, isDeleted: false } });
    if (!meeting) throw new NotFoundException('Meeting not found');

    const count = await this.prisma.meetingAgenda.count({ where: { meetingId } });
    const agendaNumber = `AGN-${String(count + 1).padStart(3, '0')}`;

    return this.prisma.meetingAgenda.create({
      data: {
        meetingId,
        agendaNumber,
        title: dto.title,
        description: dto.description || '',
        presenter: dto.presenter || '',
        estimatedDuration: dto.estimatedDuration || 15,
        sequence: dto.sequence || count + 1,
      },
    });
  }

  // 8. Update Participant & Mark Attendance
  async updateParticipant(societyId: string, meetingId: string, dto: UpdateParticipantDto) {
    const meeting = await this.prisma.meeting.findFirst({ where: { id: meetingId, societyId, isDeleted: false } });
    if (!meeting) throw new NotFoundException('Meeting not found');

    const participant = await this.prisma.meetingParticipant.upsert({
      where: {
        meetingId_personId: {
          meetingId,
          personId: dto.personId,
        },
      },
      create: {
        meetingId,
        personId: dto.personId,
        role: dto.role || 'MEMBER',
        invitationStatus: dto.invitationStatus || 'ACCEPTED',
        attendanceStatus: dto.attendanceStatus || 'PRESENT',
        checkInTime: dto.attendanceStatus === 'PRESENT' || dto.attendanceStatus === 'LATE' ? new Date() : null,
        remarks: dto.remarks || '',
      },
      update: {
        ...(dto.role ? { role: dto.role } : {}),
        ...(dto.invitationStatus ? { invitationStatus: dto.invitationStatus } : {}),
        ...(dto.attendanceStatus ? { attendanceStatus: dto.attendanceStatus } : {}),
        ...(dto.attendanceStatus === 'PRESENT' || dto.attendanceStatus === 'LATE' ? { checkInTime: new Date() } : {}),
        ...(dto.remarks !== undefined ? { remarks: dto.remarks } : {}),
      },
    });

    // Re-evaluate Quorum
    const presentCount = await this.prisma.meetingParticipant.count({
      where: { meetingId, attendanceStatus: { in: ['PRESENT', 'LATE'] } },
    });

    const isQuorumAchieved = presentCount >= meeting.requiredQuorum;
    await this.prisma.meeting.update({
      where: { id: meetingId },
      data: {
        achievedQuorum: presentCount,
        isQuorumAchieved,
      },
    });

    return participant;
  }

  // 9. Create Resolution
  async createResolution(societyId: string, meetingId: string, dto: CreateResolutionDto) {
    const meeting = await this.prisma.meeting.findFirst({ where: { id: meetingId, societyId, isDeleted: false } });
    if (!meeting) throw new NotFoundException('Meeting not found');

    const count = await this.prisma.meetingResolution.count({ where: { meetingId } });
    const resolutionNumber = `RES-${String(count + 1).padStart(3, '0')}`;

    const votesFor = dto.votesFor || 0;
    const votesAgainst = dto.votesAgainst || 0;
    const totalVotes = votesFor + votesAgainst;
    const passedByPercentage = totalVotes > 0 ? (votesFor / totalVotes) * 100 : 0;

    let status = dto.status || 'VOTING_REQUIRED';
    if (status === 'VOTING_REQUIRED' && totalVotes > 0) {
      status = passedByPercentage >= 50 ? 'APPROVED' : 'REJECTED';
    }

    return this.prisma.meetingResolution.create({
      data: {
        meetingId,
        resolutionNumber,
        title: dto.title,
        description: dto.description,
        status,
        votingRequired: dto.votingRequired ?? true,
        votesFor,
        votesAgainst,
        abstained: dto.abstained || 0,
        passedByPercentage,
        votingClosedAt: totalVotes > 0 ? new Date() : null,
        remarks: dto.remarks || '',
      },
    });
  }

  // 10. Create Action Item
  async createActionItem(societyId: string, meetingId: string, dto: CreateActionItemDto) {
    const meeting = await this.prisma.meeting.findFirst({ where: { id: meetingId, societyId, isDeleted: false } });
    if (!meeting) throw new NotFoundException('Meeting not found');

    const actionItem = await this.prisma.meetingActionItem.create({
      data: {
        meetingId,
        task: dto.task,
        ownerId: dto.ownerId || null,
        ownerName: dto.ownerName || '',
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        priority: dto.priority || 'MEDIUM',
        status: dto.status || 'OPEN',
        completionPercentage: dto.completionPercentage || 0,
        remarks: dto.remarks || '',
      },
    });

    // Notify Action Owner
    if (dto.ownerId) {
      await this.prisma.notification.create({
        data: {
          societyId,
          userId: dto.ownerId,
          title: `Action Item Assigned: ${dto.task}`,
          message: `You have been assigned a task from meeting ${meeting.meetingNumber} due on ${dto.dueDate || 'TBD'}.`,
          category: 'WARNING',
          channel: 'IN_APP',
        },
      });
    }

    return actionItem;
  }

  // 12. Publish Official Meeting Notice (Linked to Document Engine)
  async publishNotice(societyId: string, meetingId: string, noticeDocumentId?: string, actorId?: string) {
    const meeting = await this.prisma.meeting.findFirst({ where: { id: meetingId, societyId, isDeleted: false } });
    if (!meeting) throw new NotFoundException('Meeting not found');

    const updated = await this.prisma.meeting.update({
      where: { id: meetingId },
      data: {
        noticePublished: true,
        noticePublishedAt: new Date(),
        noticeDocumentId: noticeDocumentId || null,
        updatedBy: actorId,
      },
    });

    // Timeline entry
    await this.prisma.activityTimeline.create({
      data: {
        societyId,
        entityType: 'MEETING',
        entityId: meetingId,
        action: ActivityAction.UPDATED,
        title: `Official Meeting Notice Published (${meeting.meetingNumber})`,
        description: `Meeting notice published and linked to Document Engine.`,
        actorId: actorId || 'system',
      },
    });

    return updated;
  }

  // 13. Export Attendance Report
  async exportAttendance(societyId: string, meetingId: string) {
    const meeting = await this.findOne(societyId, meetingId);
    return {
      meetingNumber: meeting.meetingNumber,
      title: meeting.title,
      meetingDate: meeting.meetingDate,
      venue: meeting.venue || 'Virtual Meeting',
      requiredQuorum: meeting.requiredQuorum,
      achievedQuorum: meeting.achievedQuorum,
      isQuorumAchieved: meeting.isQuorumAchieved,
      attendance: meeting.participants.map((p) => ({
        name: p.person ? `${p.person.firstName} ${p.person.lastName}` : 'Member',
        email: p.person?.email || 'N/A',
        phone: p.person?.phone || 'N/A',
        role: p.role,
        invitationStatus: p.invitationStatus,
        attendanceStatus: p.attendanceStatus,
        checkInTime: p.checkInTime,
      })),
    };
  }

  // 14. Export Minutes of Meeting (MoM) Report
  async exportMinutes(societyId: string, meetingId: string) {
    const meeting = await this.findOne(societyId, meetingId);
    return {
      meetingNumber: meeting.meetingNumber,
      title: meeting.title,
      meetingType: meeting.meetingType,
      meetingDate: meeting.meetingDate,
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      venue: meeting.venue || 'Virtual Meeting',
      chairPerson: meeting.chairPerson ? `${meeting.chairPerson.firstName} ${meeting.chairPerson.lastName}` : 'N/A',
      secretary: meeting.secretary ? `${meeting.secretary.firstName} ${meeting.secretary.lastName}` : 'N/A',
      agendas: meeting.agendas,
      resolutions: meeting.resolutions,
      actionItems: meeting.actionItems,
      minutesApproved: meeting.minutesApproved,
      minutesNotes: meeting.minutesNotes,
    };
  }

  // 15. Automatically expose Meeting KPIs to Analytics & Dashboard Engine
  async getDashboardWidgets(societyId: string) {
    const metrics = await this.getMetrics(societyId);
    return [
      {
        widgetKey: 'MEETING_UPCOMING_COUNT',
        title: 'Upcoming Meetings',
        value: metrics.upcomingMeetings,
        unit: 'Meetings',
        category: 'MEETINGS',
      },
      {
        widgetKey: 'MEETING_ATTENDANCE_RATE',
        title: 'Avg Meeting Attendance',
        value: metrics.averageAttendancePercentage,
        unit: '%',
        category: 'MEETINGS',
      },
      {
        widgetKey: 'MEETING_RESOLUTION_PASS_RATE',
        title: 'Resolution Pass Rate',
        value: metrics.resolutionPassRate,
        unit: '%',
        category: 'MEETINGS',
      },
      {
        widgetKey: 'MEETING_OPEN_ACTIONS',
        title: 'Pending Action Items',
        value: metrics.openActionItems,
        unit: 'Tasks',
        category: 'MEETINGS',
      },
    ];
  }
}

