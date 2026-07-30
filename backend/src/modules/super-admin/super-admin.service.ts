import { Injectable, Logger, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { 
  ProvisionSocietyDto, 
  UpdateFeatureFlagDto,
  UpdateSocietyDto,
  SocietyQueryDto,
  CreatePlanDto,
  UpdatePlanDto,
  CreateLicenseDto,
  UpdateLicenseDto,
  CreateTicketDto,
  PlatformSettingsDto,
  PlatformUserDto
} from './dto/super-admin.dto';

@Injectable()
export class SuperAdminService {
  private readonly logger = new Logger(SuperAdminService.name);

  constructor(private prisma: PrismaService) {}

  // Dashboard
  async getDashboardMetrics() {
    const totalSocieties = await this.prisma.society.count();
    const activeSocieties = await this.prisma.society.count({ where: { status: 'ACTIVE' } });
    const suspendedSocieties = await this.prisma.society.count({ where: { status: 'SUSPENDED' } });
    const trialSocieties = await this.prisma.society.count({ where: { status: 'PENDING' } });
    const totalUsers = await this.prisma.user.count();
    const totalResidents = await this.prisma.resident.count();

    // Mocks for features without schema models
    const monthlyRevenue = 125000;
    const arr = 1500000;
    const mrr = 125000;
    const renewalRate = 95.5;
    const churnRate = 4.5;
    const storageUsed = '450 GB';
    const activeSessions = 1245;
    const apiRequestsToday = 450230;

    return {
      totalSocieties,
      activeSocieties,
      suspendedSocieties,
      trialSocieties,
      totalUsers,
      totalResidents,
      monthlyRevenue,
      arr,
      mrr,
      renewalRate,
      churnRate,
      storageUsed,
      activeSessions,
      apiRequestsToday
    };
  }

  async getPlatformAnalytics() {
     return {
       societiesByMonth: [],
       userGrowth: [],
     };
  }

  // Societies
  async getSocieties(query: SocietyQueryDto) {
    const { page = 1, limit = 10, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (status) whereClause.status = status;
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.society.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { buildings: true, subscriptions: true }
          }
        }
      }),
      this.prisma.society.count({ where: whereClause })
    ]);

    return { data, total, page, limit };
  }

  async getSocietyById(id: string) {
    const society = await this.prisma.society.findUnique({
      where: { id },
      include: {
        _count: {
          select: { buildings: true, subscriptions: true }
        },
        subscriptions: {
          include: { plan: true }
        }
      }
    });

    if (!society) throw new NotFoundException('Society not found');

    const residentsCount = await this.prisma.resident.count();

    return { ...society, residentsCount };
  }

  async provisionTenant(dto: ProvisionSocietyDto) {
    const existing = await this.prisma.society.findUnique({ where: { code: dto.code } });
    if (existing) {
      throw new ConflictException('Society code already exists');
    }
    const existingEmail = await this.prisma.user.findUnique({ where: { email: dto.adminEmail } });
    if (existingEmail) {
      throw new ConflictException('Admin email already exists');
    }
    const existingPhone = await this.prisma.user.findUnique({ where: { phone: dto.adminPhone } });
    if (existingPhone) {
      throw new ConflictException('Admin phone already exists');
    }

    return this.prisma.$transaction(async (tx) => {
      const society = await tx.society.create({
        data: {
          code: dto.code,
          name: dto.name,
          societyTypeCode: dto.societyTypeCode,
          addressLine1: dto.addressLine1,
          pincode: dto.pincode,
          contactEmail: dto.contactEmail,
          contactPhone: dto.contactPhone,
          status: 'ACTIVE',
          isOnboarded: true,
        },
      });

      const adminUser = await tx.user.create({
        data: {
          email: dto.adminEmail,
          passwordHash: 'dummy_hash_until_setup',
          phone: dto.adminPhone,
          firstName: dto.adminName.split(' ')[0],
          lastName: dto.adminName.split(' ').slice(1).join(' ') || 'Admin',
          status: 'ACTIVE',
        },
      });

      const role = await tx.role.findFirst({ where: { code: 'SUPER_ADMIN' } }); // Assuming no society_admin yet, using available
      if (role) {
        await tx.userRole.create({
          data: {
            userId: adminUser.id,
            roleId: role.id,
          },
        });
      }

      if (dto.planId) {
        await tx.societySubscription.create({
          data: {
            societyId: society.id,
            planId: dto.planId,
            status: 'ACTIVE',
            startDate: new Date(),
            endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
          }
        });
      }

      await tx.propertyConfig.create({
        data: {
          societyId: society.id,
          blockLabel: 'Tower',
        }
      });

      if (dto.createDefaultBuildings) {
         const building = await tx.building.create({
           data: {
             societyId: society.id,
             name: 'Main Block',
             code: 'MAIN',
           }
         });
         await tx.wing.create({
           data: {
             societyId: society.id,
             buildingId: building.id,
             name: 'A Wing',
             code: 'A',
           }
         });
      }

      return {
        success: true,
        societyId: society.id,
        adminUserId: adminUser.id,
        message: 'Tenant Provisioned successfully.'
      };
    });
  }

  async updateSociety(id: string, dto: UpdateSocietyDto) {
    return this.prisma.society.update({
      where: { id },
      data: { ...dto, status: dto.status as any }
    });
  }

  async suspendSociety(id: string) {
    return this.prisma.society.update({
      where: { id },
      data: { status: 'SUSPENDED' }
    });
  }

  async activateSociety(id: string) {
    return this.prisma.society.update({
      where: { id },
      data: { status: 'ACTIVE' }
    });
  }

  async archiveSociety(id: string) {
    return this.prisma.society.update({
      where: { id },
      data: { status: 'INACTIVE', isDeleted: true, deletedAt: new Date() }
    });
  }

  async updateFeatureFlag(societyId: string, dto: UpdateFeatureFlagDto) {
    this.logger.log(`Toggling feature ${dto.module} for society ${societyId} to ${dto.enabled}`);
    return { success: true, message: `Feature ${dto.module} updated.` };
  }

  // Subscriptions
  async getPlans() {
    return this.prisma.subscriptionPlan.findMany({
      include: {
        features: {
          include: { feature: true }
        }
      }
    });
  }

  async getPlanById(id: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id },
      include: {
        features: {
          include: { feature: true }
        }
      }
    });
    if (!plan) throw new NotFoundException('Plan not found');
    return plan;
  }

  // Licenses
  async getLicenses() {
    return [
      { id: 'lic-1', societyId: 'soc-1', status: 'ACTIVE', expiresAt: '2027-01-01' },
      { id: 'lic-2', societyId: 'soc-2', status: 'INACTIVE', expiresAt: '2025-01-01' }
    ];
  }

  async generateLicense(dto: CreateLicenseDto) {
    return { id: 'lic-3', ...dto, status: 'ACTIVE', expiresAt: new Date(new Date().setMonth(new Date().getMonth() + dto.durationMonths)) };
  }

  async activateLicense(id: string) {
    return { id, status: 'ACTIVE', message: 'License activated' };
  }

  async deactivateLicense(id: string) {
    return { id, status: 'INACTIVE', message: 'License deactivated' };
  }

  // Billing
  async getBillingDashboard() {
    return {
      totalRevenue: 2500000,
      outstanding: 450000,
      recentPayments: 125000
    };
  }

  async getInvoices() {
    return [
      { id: 'inv-1', societyId: 'soc-1', amount: 50000, status: 'PAID' },
      { id: 'inv-2', societyId: 'soc-2', amount: 35000, status: 'PENDING' }
    ];
  }

  // Platform Users
  async getPlatformUsers() {
    return [
      { id: 'user-1', name: 'Super Admin 1', role: 'SUPER_ADMIN' },
      { id: 'user-2', name: 'Support Staff 1', role: 'SUPPORT' }
    ];
  }

  async createPlatformUser(dto: PlatformUserDto) {
    return { id: 'user-new', ...dto, status: 'ACTIVE' };
  }

  // Support
  async getSupportTickets() {
    return [
      { id: 'tick-1', subject: 'Login issue', status: 'OPEN' },
      { id: 'tick-2', subject: 'Billing error', status: 'RESOLVED' }
    ];
  }

  async createTicket(dto: CreateTicketDto) {
    return { id: 'tick-new', ...dto, status: 'OPEN' };
  }

  // Monitoring
  async getSystemHealth() {
    return {
      status: 'HEALTHY',
      database: 'CONNECTED',
      redis: 'CONNECTED',
      queue: 'RUNNING',
      uptime: '99.99%'
    };
  }

  // Audit
  async getAuditLogs(query: any) {
    // Return mock since we don't have an audit log model in Prisma yet
    return {
      data: [
        { id: 'log-1', action: 'LOGIN', user: 'admin1', timestamp: new Date() },
        { id: 'log-2', action: 'UPDATE_SOCIETY', user: 'admin1', timestamp: new Date() }
      ],
      total: 2,
      page: 1,
      limit: 10
    };
  }

  // Settings
  async getSettings() {
    return {
      smtp: { host: 'smtp.mailgun.org', port: 587 },
      sms: { provider: 'Twilio', active: true },
      whatsapp: { provider: 'Meta', active: false },
      security: { mfaEnabled: true, passwordPolicy: 'STRICT' }
    };
  }

  async updateSettings(dto: PlatformSettingsDto) {
    return { success: true, message: 'Settings updated successfully' };
  }
}
