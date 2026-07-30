import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class RecordPaymentDto {
  /** The maintenance bill ID to apply payment against */
  @IsString()
  billId: string;

  /** Amount being paid now (supports partial / advance payment) */
  @IsNumber()
  @Min(1)
  paidAmount: number;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  /** Razorpay / Stripe transaction reference */
  @IsString()
  @IsOptional()
  gatewayRef?: string;

  /** Optional discount / waiver to apply to the bill */
  @IsNumber()
  @IsOptional()
  @Min(0)
  discountAmount?: number;
}
