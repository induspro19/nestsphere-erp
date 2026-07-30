import { Injectable, Inject, Logger, BadRequestException, forwardRef } from '@nestjs/common';
import { IPaymentGateway, IPaymentOrder } from './interfaces/payment-gateway.interface';
import { FinancialEngineService } from '../financial-engine/financial-engine.service';
import { MaintenanceBillingService } from '../maintenance-billing/maintenance-billing.service';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  // Simple in-memory idempotency cache for webhooks
  private readonly processedWebhooks = new Set<string>();

  constructor(
    @Inject('PAYMENT_ADAPTER') private readonly gateway: IPaymentGateway,
    private readonly prisma: PrismaService,
    private readonly financialEngineService: FinancialEngineService,
    @Inject(forwardRef(() => MaintenanceBillingService))
    private readonly maintenanceBillingService: MaintenanceBillingService,
  ) {}

  async createPaymentOrder(amount: number, receiptId: string, societyId: string, currency: string = 'INR'): Promise<IPaymentOrder> {
    this.logger.log(`Creating payment order for receipt: ${receiptId} in society ${societyId}`);
    return this.gateway.createOrder(amount, receiptId, currency);
  }

  async verifyAndCapturePayment(
    orderId: string, 
    paymentId: string, 
    signature: string, 
    billId: string, 
    societyId: string,
    personId: string,
    amount: number
  ) {
    this.logger.log(`Verifying payment for order: ${orderId}`);
    const isValid = this.gateway.verifyPayment(orderId, paymentId, signature);
    
    if (!isValid) {
      this.logger.warn(`Invalid payment signature for order: ${orderId}`);
      throw new BadRequestException('Invalid payment signature');
    }

    await this.processPaymentSuccess(societyId, billId, amount, paymentId, personId);
    
    return { success: true, message: 'Payment verified and captured' };
  }

  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    return this.gateway.verifyWebhookSignature(payload, signature, secret);
  }

  async handleWebhook(payload: any) {
    this.logger.log(`Received Webhook: ${JSON.stringify(payload)}`);
    const eventType = payload.event;
    
    if (eventType === 'payment.captured' || eventType === 'payment.authorized') {
      const paymentEntity = payload.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;
      const amount = paymentEntity.amount / 100;
      
      const idempotencyKey = `webhook_${paymentId}_${eventType}`;
      if (this.processedWebhooks.has(idempotencyKey)) {
        this.logger.log(`Webhook already processed: ${idempotencyKey}`);
        return { received: true };
      }

      // Find bill by order ID
      // Assuming we saved the orderId somewhere or the receiptId is in the payment notes.
      const receiptId = paymentEntity.notes?.receiptId || paymentEntity.receipt;
      
      if (receiptId) {
         // receiptId is actually bill.id or billNumber depending on how we set it.
         // Let's assume it's billId.
         const bill = await this.prisma.maintenanceBill.findFirst({ where: { id: receiptId }});
         if (bill && bill.status !== 'PAID') {
            await this.processPaymentSuccess(bill.societyId, bill.id, amount, paymentId, bill.personId || 'system');
         }
      }
      this.processedWebhooks.add(idempotencyKey);
    }

    return { received: true };
  }

  private async processPaymentSuccess(societyId: string, billId: string, amount: number, gatewayRef: string, actorId: string) {
      // 1. Mark bill as paid
      await this.maintenanceBillingService.recordPayment(societyId, {
        billId: billId,
        paidAmount: amount,
        paymentMethod: 'RAZORPAY',
        gatewayRef: gatewayRef
      }, actorId);

      // 2. Double-Entry Accounting
      // Retrieve the accounts for this society (Bank = 1020, Accounts Receivable = 1100)
      const accounts = await this.financialEngineService.getAccounts(societyId);
      const bankAccount = accounts.find(a => a.accountCode === '1020');
      const arAccount = accounts.find(a => a.accountCode === '1100');

      if (bankAccount && arAccount) {
         await this.financialEngineService.createJournalEntry(societyId, {
            narration: `Online Payment Received (Gateway Ref: ${gatewayRef})`,
            referenceNumber: gatewayRef,
            items: [
              { accountId: bankAccount.id, debitAmount: amount }, // Bank increases (Debit Asset)
              { accountId: arAccount.id, creditAmount: amount }   // AR decreases (Credit Asset)
            ]
         }, actorId);
      } else {
         this.logger.warn(`Could not find Bank (1020) or AR (1100) accounts for society ${societyId} to post double-entry.`);
      }
  }
}
