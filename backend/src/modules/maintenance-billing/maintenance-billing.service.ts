import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateBillConfigDto } from './dto/create-bill-config.dto';
import { GenerateBulkBillsDto } from './dto/generate-bulk-bills.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { QueryBillsDto } from './dto/query-bills.dto';
import {
  ActivityAction,
  NotificationCategory,
  NotificationChannel,
  NotificationPriority,
  PaymentMethod,
  TransactionType,
} from '@prisma/client';

@Injectable()
export class MaintenanceBillingService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  // ─────────────────────────────────────────────
  // 1. BILLING CONFIGURATION
  // ─────────────────────────────────────────────

  async getConfig(societyId: string) {
    let config = await this.prisma.maintenanceBillConfig.findUnique({
      where: { societyId },
    });

    if (!config) {
      // Auto-seed sensible defaults on first access
      config = await this.prisma.maintenanceBillConfig.create({
        data: {
          societyId,
          billingCycle: 'MONTHLY',
          baseSqFtRate: 2.5,
          flatRatePerUnit: 1500,
          sinkingFundAmount: 300,
          corpusFundAmount: 200,
          parkingCharge2Wheeler: 100,
          parkingCharge4Wheeler: 500,
          waterCharge: 150,
          electricityCharge: 200,
          lateFeePercentage: 5.0,
          dueDateDays: 15,
          gstPercentage: 18.0,
        },
      });
    }

    return config;
  }

  async upsertConfig(societyId: string, dto: CreateBillConfigDto) {
    return this.prisma.maintenanceBillConfig.upsert({
      where: { societyId },
      create: { societyId, ...dto },
      update: { ...dto },
    });
  }

  // ─────────────────────────────────────────────
  // 2. BULK BILL GENERATION  (MB-2026-00001)
  // ─────────────────────────────────────────────

  async generateBulkBills(societyId: string, dto: GenerateBulkBillsDto, actorId: string) {
    const now = new Date();
    const billingMonth =
      dto.billingMonth ||
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Fetch society billing config
    const config = await this.getConfig(societyId);

    // Fetch all active flats in this society (optionally filter by building)
    const whereFlat: any = { societyId: undefined, isDeleted: false };
    // Use building relation filter via building.societyId
    const flats = await this.prisma.flat.findMany({
      where: {
        isDeleted: false,
        building: { societyId },
        ...(dto.buildingId ? { buildingId: dto.buildingId } : {}),
      },
      include: {
        personUnits: {
          where: { occupancyStatus: 'ACTIVE', isPrimaryOccupant: true },
          include: { person: true },
        },
        vehicles: { where: { isDeleted: false } },
      },
    });

    if (!flats.length) {
      throw new BadRequestException('No active flats found for this society');
    }

    const created: string[] = [];
    const skipped: string[] = [];

    // Count existing bills to compute next bill number starting point
    let billSeq = await this.prisma.maintenanceBill.count({ where: { societyId } });

    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + Number(config.dueDateDays));

    for (const flat of flats) {
      // Skip if bill already generated for this unit+month
      const existing = await this.prisma.maintenanceBill.findFirst({
        where: { unitId: flat.id, billingMonth, isDeleted: false },
      });
      if (existing) {
        skipped.push(flat.flatNumber);
        continue;
      }

      billSeq++;
      const billNumber = `MB-${now.getFullYear()}-${String(billSeq).padStart(5, '0')}`;

      // Calculate charges
      const maintenanceAmount = flat.sqFt
        ? Number(config.baseSqFtRate) * flat.sqFt
        : Number(config.flatRatePerUnit);
      const sinkingFund = Number(config.sinkingFundAmount);
      const corpusFund = Number(config.corpusFundAmount);
      const waterCharge = Number(config.waterCharge);
      const electricityCharge = Number(config.electricityCharge);
      const utilityCharges = waterCharge + electricityCharge;

      // Parking: count 2-wheeler vs 4-wheeler
      const tw = flat.vehicles.filter((v) => v.typeCode === '2_WHEELER').length;
      const fw = flat.vehicles.filter((v) => v.typeCode !== '2_WHEELER').length;
      const parkingCharges =
        tw * Number(config.parkingCharge2Wheeler) +
        fw * Number(config.parkingCharge4Wheeler);

      const subtotal = maintenanceAmount + sinkingFund + corpusFund + utilityCharges + parkingCharges;
      const gstAmount = (subtotal * Number(config.gstPercentage)) / 100;
      const totalAmount = subtotal + gstAmount;

      // Resolve primary occupant for the bill
      const primary = flat.personUnits[0]?.person || null;

      // Create the bill record
      const bill = await this.prisma.maintenanceBill.create({
        data: {
          societyId,
          billNumber,
          unitId: flat.id,
          personId: primary?.id || null,
          billingMonth,
          maintenanceAmount,
          sinkingFund,
          corpusFund,
          utilityCharges,
          parkingCharges,
          subtotal,
          gstAmount,
          totalAmount,
          outstandingAmount: totalAmount,
          dueDate,
          status: 'UNPAID',
          createdBy: actorId,
        },
      });

      // Mirror into Financial Engine as an INVOICE transaction
      const txnCount = await this.prisma.financialTransaction.count({ where: { societyId } });
      const txnNumber = `INV-${String(txnCount + 1).padStart(5, '0')}`;

      const txn = await this.prisma.financialTransaction.create({
        data: {
          societyId,
          txnNumber,
          txnType: TransactionType.INVOICE,
          txnDate: now,
          dueDate,
          personId: primary?.id || null,
          unitId: flat.id,
          subtotal,
          taxAmount: gstAmount,
          totalAmount,
          outstandingAmount: totalAmount,
          paymentMethod: PaymentMethod.RAZORPAY,
          status: 'UNPAID',
          createdBy: actorId,
        },
      });

      // Link financial transaction back to bill
      await this.prisma.maintenanceBill.update({
        where: { id: bill.id },
        data: { financialTransactionId: txn.id },
      });

      // Send due-date reminder to primary occupant
      if (primary) {
        await this.notificationsService.send(societyId, {
          recipientType: 'USER',
          recipientId: primary.id,
          title: `Maintenance Bill Generated: ${billNumber}`,
          message: `Your maintenance bill for ${billingMonth} is ₹${totalAmount.toFixed(2)}. Due by ${dueDate.toDateString()}.`,
          channel: NotificationChannel.IN_APP,
          category: NotificationCategory.BILLING,
          priority: NotificationPriority.HIGH,
        });
      }

      created.push(billNumber);
    }

    // Activity log
    await this.prisma.activityTimeline.create({
      data: {
        societyId,
        entityType: 'MAINTENANCE_BILLING',
        entityId: societyId,
        action: ActivityAction.CREATED,
        title: `Bulk Bills Generated: ${billingMonth}`,
        description: `Created ${created.length} bills, skipped ${skipped.length} duplicates`,
        actorId,
      },
    });

    return {
      billingMonth,
      created: created.length,
      skipped: skipped.length,
      bills: created,
    };
  }

  // ─────────────────────────────────────────────
  // 3. QUERY BILLS (with search, month, status)
  // ─────────────────────────────────────────────

  async findAll(societyId: string, query: QueryBillsDto) {
    const { search, billingMonth, status, unitId, page = 1, limit = 25 } = query;
    const skip = (page - 1) * limit;

    const where: any = { societyId, isDeleted: false };
    if (billingMonth) where.billingMonth = billingMonth;
    if (status) where.status = status;
    if (unitId) where.unitId = unitId;
    if (search) {
      where.OR = [
        { billNumber: { contains: search, mode: 'insensitive' } },
        { unit: { flatNumber: { contains: search, mode: 'insensitive' } } },
        { person: { firstName: { contains: search, mode: 'insensitive' } } },
        { person: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.maintenanceBill.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ billingMonth: 'desc' }, { createdAt: 'desc' }],
        include: {
          unit: { select: { flatNumber: true, sqFt: true } },
          person: { select: { firstName: true, lastName: true, phone: true } },
          financialTransaction: { select: { txnNumber: true, status: true } },
        },
      }),
      this.prisma.maintenanceBill.count({ where }),
    ]);

    return { data: items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(societyId: string, id: string) {
    const bill = await this.prisma.maintenanceBill.findFirst({
      where: { id, societyId, isDeleted: false },
      include: {
        unit: true,
        person: true,
        financialTransaction: true,
      },
    });
    if (!bill) throw new NotFoundException('Maintenance bill not found');
    return bill;
  }

  // ─────────────────────────────────────────────
  // 4. RECORD PAYMENT (partial / advance / wallet)
  // ─────────────────────────────────────────────

  async recordPayment(societyId: string, dto: RecordPaymentDto, actorId: string) {
    const bill = await this.findOne(societyId, dto.billId);

    if (bill.status === 'PAID') {
      throw new ConflictException('This bill is already fully paid');
    }

    const discount = dto.discountAmount || 0;
    const paid = Number(dto.paidAmount);
    const outstanding = Number(bill.outstandingAmount) - discount;

    if (paid > outstanding) {
      throw new BadRequestException(
        `Payment amount ₹${paid} exceeds outstanding ₹${outstanding}`,
      );
    }

    const newOutstanding = outstanding - paid;
    const newPaid = Number(bill.paidAmount) + paid;
    const newDiscount = Number(bill.discount) + discount;
    const isFullyPaid = newOutstanding <= 0;

    const updated = await this.prisma.maintenanceBill.update({
      where: { id: bill.id },
      data: {
        paidAmount: newPaid,
        outstandingAmount: newOutstanding < 0 ? 0 : newOutstanding,
        discount: newDiscount,
        status: isFullyPaid ? 'PAID' : 'PART_PAID',
      },
    });

    // Update mirrored financial transaction
    if (bill.financialTransactionId) {
      await this.prisma.financialTransaction.update({
        where: { id: bill.financialTransactionId },
        data: {
          paidAmount: newPaid,
          outstandingAmount: newOutstanding < 0 ? 0 : newOutstanding,
          discountAmount: newDiscount,
          gatewayRef: dto.gatewayRef || null,
          status: isFullyPaid ? 'PAID' : 'PART_PAID',
        },
      });
    }

    // Apply wallet credit for advance payment if overpaid
    if (newOutstanding < 0 && bill.personId) {
      const walletCredit = Math.abs(newOutstanding);
      await this.prisma.memberWallet.upsert({
        where: { personId: bill.personId },
        create: { societyId, personId: bill.personId, balance: walletCredit },
        update: { balance: { increment: walletCredit } },
      });
    }

    // Notification to resident
    if (bill.personId) {
      await this.notificationsService.send(societyId, {
        recipientType: 'USER',
        recipientId: bill.personId,
        title: isFullyPaid ? `Payment Received: ${bill.billNumber}` : `Part Payment Recorded: ${bill.billNumber}`,
        message: isFullyPaid
          ? `Full payment of ₹${paid} received. Balance cleared.`
          : `₹${paid} received. Outstanding balance: ₹${newOutstanding.toFixed(2)}.`,
        channel: NotificationChannel.IN_APP,
        category: NotificationCategory.BILLING,
        priority: NotificationPriority.MEDIUM,
      });
    }

    await this.prisma.activityTimeline.create({
      data: {
        societyId,
        entityType: 'MAINTENANCE_BILL',
        entityId: bill.id,
        action: ActivityAction.UPDATED,
        title: `Payment Recorded: ₹${paid} for ${bill.billNumber}`,
        description: isFullyPaid ? 'Bill fully settled' : `Outstanding: ₹${newOutstanding.toFixed(2)}`,
        actorId,
      },
    });

    return updated;
  }

  // ─────────────────────────────────────────────
  // 5. APPLY LATE FEES (call via scheduler)
  // ─────────────────────────────────────────────

  async applyLateFees(societyId: string, actorId: string) {
    const config = await this.getConfig(societyId);
    const today = new Date();

    const overdueBills = await this.prisma.maintenanceBill.findMany({
      where: {
        societyId,
        isDeleted: false,
        status: { in: ['UNPAID', 'PART_PAID'] },
        dueDate: { lt: today },
        lateFee: { equals: 0 },
      },
    });

    let applied = 0;
    for (const bill of overdueBills) {
      const lateFee =
        (Number(bill.outstandingAmount) * Number(config.lateFeePercentage)) / 100;

      await this.prisma.maintenanceBill.update({
        where: { id: bill.id },
        data: {
          lateFee,
          totalAmount: { increment: lateFee },
          outstandingAmount: { increment: lateFee },
          status: 'OVERDUE',
        },
      });

      applied++;
    }

    return { applied, message: `Late fees applied to ${applied} overdue bills` };
  }

  // ─────────────────────────────────────────────
  // 6. BILLING DASHBOARD METRICS
  // ─────────────────────────────────────────────

  async getMetrics(societyId: string) {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const bills = await this.prisma.maintenanceBill.findMany({
      where: { societyId, isDeleted: false },
      select: {
        status: true,
        totalAmount: true,
        paidAmount: true,
        outstandingAmount: true,
        lateFee: true,
        billingMonth: true,
      },
    });

    let totalBilled = 0;
    let totalCollected = 0;
    let totalOutstanding = 0;
    let totalLateFees = 0;
    let currentMonthBilled = 0;
    let currentMonthCollected = 0;
    let unpaidCount = 0;
    let overdueCount = 0;

    bills.forEach((b) => {
      totalBilled += Number(b.totalAmount);
      totalCollected += Number(b.paidAmount);
      totalOutstanding += Number(b.outstandingAmount);
      totalLateFees += Number(b.lateFee);
      if (b.billingMonth === currentMonth) {
        currentMonthBilled += Number(b.totalAmount);
        currentMonthCollected += Number(b.paidAmount);
      }
      if (b.status === 'UNPAID' || b.status === 'PART_PAID') unpaidCount++;
      if (b.status === 'OVERDUE') overdueCount++;
    });

    const collectionRate =
      totalBilled > 0 ? Number(((totalCollected / totalBilled) * 100).toFixed(1)) : 0;

    return {
      totalBilled,
      totalCollected,
      totalOutstanding,
      totalLateFees,
      currentMonthBilled,
      currentMonthCollected,
      unpaidCount,
      overdueCount,
      collectionRate,
    };
  }

  // ─────────────────────────────────────────────
  // 7. RECEIVABLES AGING ANALYSIS  (0-30/31-60/61-90/90+)
  // ─────────────────────────────────────────────

  async getAgingAnalysis(societyId: string) {
    const today = new Date();

    const unpaid = await this.prisma.maintenanceBill.findMany({
      where: {
        societyId,
        isDeleted: false,
        status: { in: ['UNPAID', 'PART_PAID', 'OVERDUE'] },
      },
      select: {
        dueDate: true,
        outstandingAmount: true,
        unit: { select: { flatNumber: true } },
        person: { select: { firstName: true, lastName: true } },
      },
    });

    const buckets = { '0_30': 0, '31_60': 0, '61_90': 0, '90_plus': 0 };

    unpaid.forEach((b) => {
      const daysPast = Math.floor(
        (today.getTime() - new Date(b.dueDate).getTime()) / (1000 * 60 * 60 * 24),
      );
      const amount = Number(b.outstandingAmount);
      if (daysPast <= 30) buckets['0_30'] += amount;
      else if (daysPast <= 60) buckets['31_60'] += amount;
      else if (daysPast <= 90) buckets['61_90'] += amount;
      else buckets['90_plus'] += amount;
    });

    return { aging: buckets, totalDebtors: unpaid.length };
  }
}
