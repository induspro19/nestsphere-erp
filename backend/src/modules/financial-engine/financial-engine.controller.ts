import { Audit } from '../../common/decorators/audit.decorator';
import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FinancialEngineService } from './financial-engine.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryFinancialDto } from './dto/query-financial.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { ActiveUser } from '../../common/decorators/active-user.decorator';

@ApiTags('Enterprise Financial & Accounting Engine')
@ApiBearerAuth()
@Audit()
@Controller('financials')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FinancialEngineController {
  constructor(private financialService: FinancialEngineService) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Get Financial Receivables, Collections & Wallet Metrics' })
  async getMetrics(@CurrentTenant() societyId: string) {
    return this.financialService.getMetrics(societyId);
  }

  @Get('aging')
  @ApiOperation({ summary: 'Get Outstanding Aging Analysis (0-30, 31-60, 61-90, 90+ Days)' })
  async getAgingAnalysis(@CurrentTenant() societyId: string) {
    return this.financialService.getAgingAnalysis(societyId);
  }

  @Get('accounts')
  @ApiOperation({ summary: 'Get Chart of Accounts (Asset, Liability, Equity, Income, Expense)' })
  async getAccounts(@CurrentTenant() societyId: string) {
    return this.financialService.getAccounts(societyId);
  }

  @Post('accounts')
  @ApiOperation({ summary: 'Create Chart of Accounts Ledger Entry' })
  async createAccount(@CurrentTenant() societyId: string, @Body() dto: CreateAccountDto) {
    return this.financialService.createAccount(societyId, dto);
  }

  @Post('journal')
  @ApiOperation({ summary: 'Post Double-Entry General Ledger Journal Entry' })
  async createJournalEntry(
    @CurrentTenant() societyId: string,
    @Body() dto: CreateJournalEntryDto,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.financialService.createJournalEntry(societyId, dto, actorId);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Query All Invoices, Receipts, Credit/Debit Notes & Transactions' })
  async findAllTransactions(@CurrentTenant() societyId: string, @Query() query: QueryFinancialDto) {
    return this.financialService.findAllTransactions(societyId, query);
  }

  @Post('transactions')
  @ApiOperation({ summary: 'Create Financial Transaction (Invoice, Receipt, Credit Note, Wallet Topup)' })
  async createTransaction(
    @CurrentTenant() societyId: string,
    @Body() dto: CreateTransactionDto,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.financialService.createTransaction(societyId, dto, actorId);
  }

  @Post('transactions/:id/pay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process Receipt Payment against Outstanding Invoice' })
  async payTransaction(
    @CurrentTenant() societyId: string,
    @Param('id') txnId: string,
    @Body('amount') amount: number,
    @Body('paymentMethod') paymentMethod: string,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.financialService.payTransaction(societyId, txnId, amount, paymentMethod, actorId);
  }
}
