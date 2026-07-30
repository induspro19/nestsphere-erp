import { Controller, Post, Body, Headers, HttpCode, HttpStatus, UnauthorizedException, Logger, RawBodyRequest, Req } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ConfigService } from '@nestjs/config';

@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(
    private readonly paymentService: PaymentService,
    private readonly configService: ConfigService
  ) {}

  @Post('webhooks/razorpay')
  @HttpCode(HttpStatus.OK)
  async handleRazorpayWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-razorpay-signature') signature: string,
    @Body() payload: any
  ) {
    this.logger.log('Received Razorpay Webhook');
    
    if (!signature) {
      throw new UnauthorizedException('Missing signature');
    }

    const secret = this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET') || 'dummy_webhook_secret';
    
    // In NestJS, to verify signature properly we need the raw body. 
    // Assuming standard parsed body for now, but in production rawBody is preferred.
    const rawBodyString = req.rawBody ? req.rawBody.toString() : JSON.stringify(payload);

    const isValid = this.paymentService.verifyWebhookSignature(rawBodyString, signature, secret);

    if (!isValid) {
      this.logger.error('Invalid Webhook Signature');
      throw new UnauthorizedException('Invalid signature');
    }

    await this.paymentService.handleWebhook(payload);
    
    return { status: 'ok' };
  }
}
