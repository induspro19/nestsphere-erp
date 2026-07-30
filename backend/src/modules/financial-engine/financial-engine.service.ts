import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryFinancialDto } from './dto/query-financial.dto';
import { ActivityAction } from '@prisma/client';

@Injectable()
export class FinancialEngineService {
  constructor(private prisma: PrismaService) {}

  // 1. Chart of Accounts Setup & Retrieval
  async getAccounts(societyId: string) {
    const existing = await this.prisma.financialAccount.findMany({
      where: { societyId },
      orderBy: { accountCode: 'asc' },
    });

    if (existing.length === 0) {
      const defaultAccounts = [
        { code: '1010', name: 'Cash in Hand', type: 'ASSET' },
        { code: '1020', name: 'Main Bank Account', type: 'ASSET' },
        { code: '1100', name: 'Accounts Receivable (Members)', type: 'ASSET' },
        { code: '2010', name: 'Accounts Payable (Vendors)', type: 'LIABILITY' },
        { code: '2020', name: 'GST Payable', type: 'LIABILITY' },
        { code: '3010', name: 'Society Corpus Fund', type: 'EQUITY' },
        { code: '4010', name: 'Maintenance Dues Income', type: 'INCOME' },
        { code: '4020', name: 'Facility & Amenity Booking Income', type: 'INCOME' },
        { code: '5010', name: 'Electricity & Utility Expenses', type: 'EXPENSE' },
        { code: '5020', name: 'Security Staff Expenses', type: 'EXPENSE' },
        { code: '5030', name: 'Housekeeping & Maintenance Expenses', type: 'EXPENSE' },
      ];

      await this.prisma.financialAccount.createMany({
        data: defaultAccounts.map((a) => ({
          societyId,
          accountCode: a.code,
          accountName: a.name,
          type: a.type as any,
          isSystem: true,
        })),
      });

      return this.prisma.financialAccount.findMany({
        where: { societyId },
        orderBy: { accountCode: 'asc' },
      });
    }

    return existing;
  }

  async createAccount(societyId: string, dto: CreateAccountDto) {
    return this.prisma.financialAccount.create({
      data: {
        societyId,
        accountCode: dto.accountCode,
        accountName: dto.accountName,
        type: dto.type,
        balance: dto.balance || 0,
      },
    });
  }

  // 2. Double-Entry General Ledger Journal Entry
  async createJournalEntry(societyId: string, dto: CreateJournalEntryDto, actorId: string) {
    let totalDebit = 0;
    let totalCredit = 0;

    dto.items.forEach((item) => {
      totalDebit += item.debitAmount || 0;
      totalCredit += item.creditAmount || 0;
    });

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new BadRequestException(
        `DOUBLE ENTRY UNBALANCED: Total Debit ($${totalDebit.toFixed(2)}) must equal Total Credit ($${totalCredit.toFixed(2)})`,
      );
    }

    const count = await this.prisma.journalEntry.count({ where: { societyId } });
    const entryNumber = `JRN-${String(count + 1).padStart(5, '0')}`;

    const journal = await this.prisma.journalEntry.create({
      data: {
        societyId,
        entryNumber,
        narration: dto.narration,
        referenceNumber: dto.referenceNumber,
        totalAmount: totalDebit,
        createdBy: actorId,
        items: {
          create: dto.items.map((i) => ({
            accountId: i.accountId,
            debitAmount: i.debitAmount || 0,
            creditAmount: i.creditAmount || 0,
            notes: i.notes,
          })),
        },
      },
      include: { items: { include: { account: true } } },
    });

    // Update Account Balances
    for (const item of dto.items) {
      const netChange = (item.debitAmount || 0) - (item.creditAmount || 0);
      await this.prisma.financialAccount.update({
        where: { id: item.accountId },
        data: { balance: { increment: netChange } },
      });
    }

    // Log Activity Timeline
    await this.prisma.activityTimeline.create({
      data: {
        societyId,
        entityType: 'FINANCIAL_JOURNAL',
        entityId: journal.id,
        action: ActivityAction.CREATED,
        title: `Journal Entry Posted (${entryNumber})`,
        description: `Posted $${totalDebit.toFixed(2)} double-entry transaction`,
        actorId,
      },
    });

    return journal;
  }

  // 3. Financial Transactions (Invoice, Receipt, Credit/Debit Note, Wallet Topup)
  async createTransaction(societyId: string, dto: CreateTransactionDto, actorId: string) {
    return await this.prisma.$transaction(async (tx) => {
      const count = await tx.financialTransaction.count({ where: { societyId } });
      const prefix = dto.txnType === 'INVOICE' ? 'INV' : dto.txnType === 'PAYMENT' ? 'PAY' : dto.txnType === 'RECEIPT' ? 'REC' : 'TXN';
      const txnNumber = `${prefix}-${String(count + 1).padStart(5, '0')}`;

      const totalAmount = dto.subtotal + (dto.taxAmount || 0) + (dto.penaltyAmount || 0) - (dto.discountAmount || 0);
      const isPaidNow = dto.txnType === 'PAYMENT' || dto.txnType === 'RECEIPT';
      const paidAmount = isPaidNow ? totalAmount : 0;
      const outstandingAmount = totalAmount - paidAmount;
      const status = isPaidNow ? 'PAID' : 'UNPAID';

      const txn = await tx.financialTransaction.create({
        data: {
          societyId,
          txnNumber,
          txnType: dto.txnType,
          personId: dto.personId || null,
          unitId: dto.unitId || null,
          subtotal: dto.subtotal,
          taxAmount: dto.taxAmount || 0,
          penaltyAmount: dto.penaltyAmount || 0,
          discountAmount: dto.discountAmount || 0,
          totalAmount,
          paidAmount,
          outstandingAmount,
          paymentMethod: dto.paymentMethod || 'RAZORPAY',
          gatewayRef: dto.gatewayRef || null,
          status,
          dueDate: dto.dueDate ? new Date(dto.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          createdBy: actorId,
        },
        include: { person: true, unit: true },
      });

      // If Wallet Topup, increment Member Wallet
      if (dto.txnType === 'WALLET_TOPUP' && dto.personId) {
        await tx.memberWallet.upsert({
          where: { personId: dto.personId },
          create: { societyId, personId: dto.personId, balance: totalAmount },
          update: { balance: { increment: totalAmount } },
        });
      }

      return txn;
    });
  }

  // 4. Pay Outstanding Transaction
  async payTransaction(societyId: string, txnId: string, amount: number, paymentMethod: string, actorId: string) {
    return await this.prisma.$transaction(async (tx) => {
      const txn = await tx.financialTransaction.findFirst({
        where: { id: txnId, societyId, isDeleted: false },
      });

      if (!txn) throw new NotFoundException('Transaction record not found');

      const newPaidAmount = Number(txn.paidAmount) + amount;
      const newOutstanding = Number(txn.totalAmount) - newPaidAmount;
      const status = newOutstanding <= 0 ? 'PAID' : 'PARTIALLY_PAID';

      const updated = await tx.financialTransaction.update({
        where: { id: txnId },
        data: {
          paidAmount: newPaidAmount,
          outstandingAmount: Math.max(0, newOutstanding),
          status,
          paymentMethod: paymentMethod as any,
        },
      });

      return updated;
    });
  }

  // 5. Receivables Aging Analysis (0-30, 31-60, 61-90, 90+ Days)
  async getAgingAnalysis(societyId: string) {
    const unpaidInvoices = await this.prisma.financialTransaction.findMany({
      where: {
        societyId,
        txnType: 'INVOICE',
        status: { in: ['UNPAID', 'PARTIALLY_PAID'] },
        isDeleted: false,
      },
      include: { person: true, unit: true },
    });

    const now = new Date();
    let current0To30 = 0;
    let days31To60 = 0;
    let days61To90 = 0;
    let days90Plus = 0;

    unpaidInvoices.forEach((inv) => {
      const outstanding = Number(inv.outstandingAmount);
      const ageDays = Math.floor((now.getTime() - new Date(inv.txnDate).getTime()) / (1000 * 60 * 60 * 24));

      if (ageDays <= 30) current0To30 += outstanding;
      else if (ageDays <= 60) days31To60 += outstanding;
      else if (ageDays <= 90) days61To90 += outstanding;
      else days90Plus += outstanding;
    });

    return {
      totalOutstanding: current0To30 + days31To60 + days61To90 + days90Plus,
      current0To30,
      days31To60,
      days61To90,
      days90Plus,
      unpaidInvoiceCount: unpaidInvoices.length,
    };
  }

  // 6. Financial Metrics Dashboard
  async getMetrics(societyId: string) {
    const txns = await this.prisma.financialTransaction.findMany({
      where: { societyId, isDeleted: false },
      select: { txnType: true, totalAmount: true, paidAmount: true, outstandingAmount: true, status: true },
    });

    let totalBilled = 0;
    let totalCollected = 0;
    let totalOutstanding = 0;

    txns.forEach((t) => {
      totalBilled += Number(t.totalAmount || 0);
      totalCollected += Number(t.paidAmount || 0);
      totalOutstanding += Number(t.outstandingAmount || 0);
    });

    const wallets = await this.prisma.memberWallet.findMany({ where: { societyId } });
    const totalWalletBalance = wallets.reduce((sum, w) => sum + Number(w.balance || 0), 0);

    return {
      totalBilled,
      totalCollected,
      totalOutstanding,
      totalWalletBalance,
      totalTransactions: txns.length,
    };
  }

  // 7. Query All Financial Transactions
  async findAllTransactions(societyId: string, query: QueryFinancialDto) {
    const { search, txnType, status, unitId, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = { societyId, isDeleted: false };

    if (search) {
      where.OR = [
        { txnNumber: { contains: search, mode: 'insensitive' } },
        { gatewayRef: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (txnType) where.txnType = txnType;
    if (status) where.status = status;
    if (unitId) where.unitId = unitId;

    const [items, total] = await Promise.all([
      this.prisma.financialTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { person: true, unit: true },
      }),
      this.prisma.financialTransaction.count({ where }),
    ]);

    return {
      data: items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
