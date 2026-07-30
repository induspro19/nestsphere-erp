import { IPaymentGateway, IPaymentOrder } from '../interfaces/payment-gateway.interface';
import * as crypto from 'crypto';
import Razorpay from 'razorpay';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RazorpayAdapter implements IPaymentGateway {
  private readonly logger = new Logger(RazorpayAdapter.name);
  private instance: any;

  constructor(private configService: ConfigService) {
    const key_id = this.configService.get<string>('RAZORPAY_KEY_ID') || 'rzp_test_dummy';
    const key_secret = this.configService.get<string>('RAZORPAY_KEY_SECRET') || 'dummy_secret';
    
    // We only instantiate if keys are present (or dummies for testing)
    try {
      this.instance = new Razorpay({ key_id, key_secret });
    } catch (e) {
      this.logger.warn('Failed to initialize Razorpay SDK (keys missing or invalid)');
    }
  }

  async createOrder(amount: number, receiptId: string, currency: string = 'INR'): Promise<IPaymentOrder> {
    try {
      const options = {
        amount: Math.round(amount * 100), // amount in smallest currency unit
        currency,
        receipt: receiptId,
      };
      const order = await this.instance.orders.create(options);
      
      return {
        id: order.id,
        amount: order.amount / 100,
        currency: order.currency,
        status: order.status,
        receipt: order.receipt,
      };
    } catch (error: any) {
      this.logger.error(`Failed to create Razorpay order: ${error.message}`, error.stack);
      throw new Error(`Payment Gateway Error: ${error.message}`);
    }
  }

  verifyPayment(orderId: string, paymentId: string, signature: string): boolean {
    const key_secret = this.configService.get<string>('RAZORPAY_KEY_SECRET') || 'dummy_secret';
    const generated_signature = crypto
      .createHmac('sha256', key_secret)
      .update(orderId + '|' + paymentId)
      .digest('hex');
      
    return generated_signature === signature;
  }

  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
      
    return expectedSignature === signature;
  }
}
