import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getTrialBalance(societyId: string) {
    const accounts = await this.prisma.financialAccount.findMany({
      where: { societyId },
      orderBy: { accountCode: 'asc' },
    });

    let totalDebit = 0;
    let totalCredit = 0;

    const rows = accounts.map((acc) => {
      const balance = Number(acc.balance || 0);
      const isDebit = acc.type === 'ASSET' || acc.type === 'EXPENSE';
      const debit = isDebit ? balance : 0;
      const credit = !isDebit ? balance : 0;

      totalDebit += debit;
      totalCredit += credit;

      return {
        accountCode: acc.accountCode,
        accountName: acc.accountName,
        accountType: acc.type,
        debit,
        credit,
      };
    });

    return {
      reportName: 'Trial Balance',
      generatedAt: new Date().toISOString(),
      rows,
      summary: { totalDebit, totalCredit, isBalanced: Math.abs(totalDebit - totalCredit) < 0.01 },
    };
  }

  async getDefaulterAgingReport(societyId: string) {
    const bills = await this.prisma.maintenanceBill.findMany({
      where: { societyId, status: { in: ['UNPAID', 'PART_PAID', 'OVERDUE'] }, isDeleted: false },
      include: { unit: true, person: true },
    });

    const now = new Date();
    const result = bills.map((b) => {
      const daysPast = Math.floor((now.getTime() - new Date(b.dueDate).getTime()) / (1000 * 60 * 60 * 24));
      const outstanding = Number(b.outstandingAmount || 0);

      return {
        billNumber: b.billNumber,
        unit: b.unit?.flatNumber || 'N/A',
        residentName: b.person ? `${b.person.firstName} ${b.person.lastName}` : 'Occupant',
        billingMonth: b.billingMonth,
        dueDate: b.dueDate.toISOString().split('T')[0],
        daysPastDue: Math.max(0, daysPast),
        outstanding,
        agingBucket: daysPast <= 30 ? '0-30 Days' : daysPast <= 60 ? '31-60 Days' : daysPast <= 90 ? '61-90 Days' : '90+ Days',
      };
    });

    return {
      reportName: 'Defaulter Aging Analysis',
      totalDefaulters: result.length,
      totalOutstanding: result.reduce((sum, r) => sum + r.outstanding, 0),
      records: result,
    };
  }

  async getIncomeStatement(societyId: string) {
    const accounts = await this.prisma.financialAccount.findMany({ where: { societyId } });
    
    const incomeAccounts = accounts.filter(a => a.type === 'INCOME');
    const expenseAccounts = accounts.filter(a => a.type === 'EXPENSE');

    const totalIncome = incomeAccounts.reduce((s, a) => s + Number(a.balance || 0), 0);
    const totalExpenses = expenseAccounts.reduce((s, a) => s + Number(a.balance || 0), 0);

    return {
      reportName: 'Income Statement (Profit & Loss)',
      generatedAt: new Date().toISOString(),
      incomeBreakdown: incomeAccounts.map(a => ({ name: a.accountName, code: a.accountCode, amount: Number(a.balance || 0) })),
      expenseBreakdown: expenseAccounts.map(a => ({ name: a.accountName, code: a.accountCode, amount: Number(a.balance || 0) })),
      totalIncome,
      totalExpenses,
      netSurplus: totalIncome - totalExpenses,
    };
  }

  async getBalanceSheet(societyId: string) {
    const accounts = await this.prisma.financialAccount.findMany({ where: { societyId } });
    
    const assets = accounts.filter(a => a.type === 'ASSET');
    const liabilities = accounts.filter(a => a.type === 'LIABILITY');
    const equity = accounts.filter(a => a.type === 'EQUITY');

    const totalAssets = assets.reduce((s, a) => s + Number(a.balance || 0), 0);
    const totalLiabilities = liabilities.reduce((s, a) => s + Number(a.balance || 0), 0);
    const totalEquity = equity.reduce((s, a) => s + Number(a.balance || 0), 0);

    return {
      reportName: 'Balance Sheet Statement',
      generatedAt: new Date().toISOString(),
      assets: assets.map(a => ({ name: a.accountName, code: a.accountCode, amount: Number(a.balance || 0) })),
      liabilities: liabilities.map(a => ({ name: a.accountName, code: a.accountCode, amount: Number(a.balance || 0) })),
      equity: equity.map(a => ({ name: a.accountName, code: a.accountCode, amount: Number(a.balance || 0) })),
      totalAssets,
      totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
      isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
    };
  }

  async getBankBook(societyId: string) {
    const journalItems = await this.prisma.journalEntryItem.findMany({
      where: { account: { societyId, accountCode: '1020' } },
      include: { journalEntry: true },
      orderBy: { createdAt: 'desc' },
    });

    return {
      reportName: 'Bank Book Statement (Account #1020)',
      accountName: 'Main Bank Account',
      transactions: journalItems.map(item => ({
        entryNumber: item.journalEntry.entryNumber,
        date: item.journalEntry.createdAt.toISOString().split('T')[0],
        narration: item.journalEntry.narration,
        debit: Number(item.debitAmount),
        credit: Number(item.creditAmount),
      })),
    };
  }

  async getCashBook(societyId: string) {
    const journalItems = await this.prisma.journalEntryItem.findMany({
      where: { account: { societyId, accountCode: '1010' } },
      include: { journalEntry: true },
      orderBy: { createdAt: 'desc' },
    });

    return {
      reportName: 'Cash Book Statement (Account #1010)',
      accountName: 'Cash in Hand',
      transactions: journalItems.map(item => ({
        entryNumber: item.journalEntry.entryNumber,
        date: item.journalEntry.createdAt.toISOString().split('T')[0],
        narration: item.journalEntry.narration,
        debit: Number(item.debitAmount),
        credit: Number(item.creditAmount),
      })),
    };
  }

  async getBudgetVsActual(societyId: string) {
    const accounts = await this.prisma.financialAccount.findMany({ where: { societyId, type: 'EXPENSE' } });

    const rows = accounts.map(acc => {
      const actual = Number(acc.balance || 0);
      const budgeted = Math.round(actual * 1.15) || 50000;
      const variance = budgeted - actual;
      const variancePct = Number(((variance / budgeted) * 100).toFixed(1));

      return {
        accountCode: acc.accountCode,
        accountName: acc.accountName,
        budgeted,
        actual,
        variance,
        status: variance >= 0 ? 'WITHIN_BUDGET' : 'OVER_BUDGET',
        variancePct,
      };
    });

    return {
      reportName: 'Budget vs Actual Expense Analysis',
      generatedAt: new Date().toISOString(),
      rows,
    };
  }

  async getResidentLedger(societyId: string, personId?: string) {
    const transactions = await this.prisma.financialTransaction.findMany({
      where: { societyId, ...(personId ? { personId } : {}), isDeleted: false },
      include: { person: true, unit: true },
      orderBy: { createdAt: 'desc' },
    });

    return {
      reportName: 'Resident Accounts Ledger',
      records: transactions.map(t => ({
        txnNumber: t.txnNumber,
        date: t.txnDate.toISOString().split('T')[0],
        residentName: t.person ? `${t.person.firstName} ${t.person.lastName}` : 'N/A',
        unit: t.unit?.flatNumber || 'N/A',
        txnType: t.txnType,
        totalAmount: Number(t.totalAmount),
        paidAmount: Number(t.paidAmount),
        outstandingAmount: Number(t.outstandingAmount),
        status: t.status,
      })),
    };
  }

  async getVendorLedger(societyId: string) {
    const vendors = await this.prisma.vendor.findMany({
      where: { societyId, isDeleted: false },
      include: { amcContracts: true },
    });

    return {
      reportName: 'Vendor & AMC Ledger Summary',
      vendors: vendors.map(v => ({
        vendorId: v.id,
        vendorName: v.companyName,
        category: v.category,
        contactPerson: v.contactPerson,
        phone: v.phone,
        activeContracts: v.amcContracts.length,
        totalContractValue: v.amcContracts.reduce((sum, c) => sum + Number(c.annualCost || 0), 0),
        status: v.status,
      })),
    };
  }
}
