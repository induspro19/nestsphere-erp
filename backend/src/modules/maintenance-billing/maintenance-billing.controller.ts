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
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MaintenanceBillingService } from './maintenance-billing.service';
import { PaymentService } from '../payment/payment.service';
import { CreateBillConfigDto } from './dto/create-bill-config.dto';
import { GenerateBulkBillsDto } from './dto/generate-bulk-bills.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { QueryBillsDto } from './dto/query-bills.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { ActiveUser } from '../../common/decorators/active-user.decorator';

@ApiTags('Enterprise Maintenance Billing Engine')
@ApiBearerAuth()
@Audit()
@Controller('maintenance-billing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MaintenanceBillingController {
  constructor(
    private billingService: MaintenanceBillingService,
    private paymentService: PaymentService
  ) {}

  // ── Configuration ─────────────────────────────────

  @Get('config')
  @ApiOperation({ summary: 'Get Billing Config (Rates, GST, Due-Date Policy, Late Fee %)' })
  async getConfig(@CurrentTenant() societyId: string) {
    return this.billingService.getConfig(societyId);
  }

  @Put('config')
  @ApiOperation({ summary: 'Upsert Billing Config (Sinking Fund, Corpus, GST, Parking Rates)' })
  async upsertConfig(
    @CurrentTenant() societyId: string,
    @Body() dto: CreateBillConfigDto,
  ) {
    return this.billingService.upsertConfig(societyId, dto);
  }

  // ── Dashboard Metrics & Analytics ─────────────────

  @Get('metrics')
  @ApiOperation({ summary: 'Billing Dashboard Metrics (Collection Rate, Outstanding, Overdue)' })
  async getMetrics(@CurrentTenant() societyId: string) {
    return this.billingService.getMetrics(societyId);
  }

  @Get('aging')
  @ApiOperation({ summary: 'Receivables Aging Analysis (0-30 / 31-60 / 61-90 / 90+ Days)' })
  async getAgingAnalysis(@CurrentTenant() societyId: string) {
    return this.billingService.getAgingAnalysis(societyId);
  }

  // ── Bill Generation ────────────────────────────────

  @Post('generate-bulk')
  @ApiOperation({ summary: 'Generate Bulk Maintenance Bills for All Active Units (MB-2026-00001)' })
  async generateBulkBills(
    @CurrentTenant() societyId: string,
    @Body() dto: GenerateBulkBillsDto,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.billingService.generateBulkBills(societyId, dto, actorId);
  }

  // ── Bill Queries ───────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Query Bills (Filter by Month, Status, Unit, Resident)' })
  async findAll(@CurrentTenant() societyId: string, @Query() query: QueryBillsDto) {
    return this.billingService.findAll(societyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Single Bill (Line-Item Breakdown, GST, Late Fee, Payments)' })
  async findOne(@CurrentTenant() societyId: string, @Param('id') id: string) {
    return this.billingService.findOne(societyId, id);
  }

  // ── Payments ───────────────────────────────────────

  @Post('pay')
  @ApiOperation({ summary: 'Record Payment (UPI / Razorpay / Cash / Cheque — Partial or Full)' })
  async recordPayment(
    @CurrentTenant() societyId: string,
    @Body() dto: RecordPaymentDto,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.billingService.recordPayment(societyId, dto, actorId);
  }

  @Post(':id/initiate-payment')
  @ApiOperation({ summary: 'Initiate Online Gateway Payment for a Bill' })
  async initiatePayment(
    @CurrentTenant() societyId: string,
    @Param('id') billId: string,
    @ActiveUser('sub') actorId: string,
  ) {
    const bill = await this.billingService.findOne(societyId, billId);
    if (bill.status === 'PAID') {
       throw new BadRequestException('Bill is already paid');
    }
    
    // Create payment order via Gateway
    const order = await this.paymentService.createPaymentOrder(
       Number(bill.outstandingAmount),
       bill.id,
       societyId
    );
    
    return {
       orderId: order.id,
       amount: order.amount,
       currency: order.currency,
       receipt: order.receipt
    };
  }

  @Post(':id/verify-payment')
  @ApiOperation({ summary: 'Verify and Capture Online Payment' })
  async verifyPayment(
    @CurrentTenant() societyId: string,
    @Param('id') billId: string,
    @Body() dto: { orderId: string; paymentId: string; signature: string; amount: number },
    @ActiveUser('sub') actorId: string,
  ) {
    return this.paymentService.verifyAndCapturePayment(
       dto.orderId,
       dto.paymentId,
       dto.signature,
       billId,
       societyId,
       actorId,
       dto.amount
    );
  }

  // ── Late Fees ──────────────────────────────────────

  @Post('apply-late-fees')
  @ApiOperation({ summary: 'Apply Late Fee % to All Overdue Unpaid Bills' })
  async applyLateFees(
    @CurrentTenant() societyId: string,
    @ActiveUser('sub') actorId: string,
  ) {
    return this.billingService.applyLateFees(societyId, actorId);
  }
}
