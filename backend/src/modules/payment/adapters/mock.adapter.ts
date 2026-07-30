import { IPaymentGateway, IPaymentOrder } from '../interfaces/payment-gateway.interface';
import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class MockPaymentAdapter implements IPaymentGateway {
  private readonly logger = new Logger(MockPaymentAdapter.name);

  async createOrder(amount: number, receiptId: string, currency: string = 'INR'): Promise<IPaymentOrder> {
    this.logger.log(`[MOCK] Creating order for receipt ${receiptId}, amount ${amount}`);
    
    // Generate a mock order ID
    const mockOrderId = `order_mock_${crypto.randomBytes(8).toString('hex')}`;
    
    return {
      id: mockOrderId,
      amount,
      currency,
      status: 'created',
      receipt: receiptId,
    };
  }

  verifyPayment(orderId: string, paymentId: string, signature: string): boolean {
    this.logger.log(`[MOCK] Verifying payment order: ${orderId}, payment: ${paymentId}`);
    
    // In the mock adapter, if signature is 'mock_success_signature', we accept it.
    // This allows the frontend to easily simulate success/failure.
    return signature === 'mock_success_signature' || signature === 'valid';
  }

  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    this.logger.log(`[MOCK] Verifying webhook signature`);
    return signature === 'mock_valid_webhook_signature';
  }
}
