import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { TransactionType, PaymentMethod } from '@prisma/client';

export class CreateTransactionDto {
  @IsEnum(TransactionType)
  @IsNotEmpty({ message: 'Transaction type is required' })
  txnType: TransactionType; // INVOICE, PAYMENT, RECEIPT, CREDIT_NOTE, DEBIT_NOTE, REFUND, WALLET_TOPUP

  @IsString()
  @IsOptional()
  personId?: string;

  @IsString()
  @IsOptional()
  unitId?: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Subtotal is required' })
  subtotal: number;

  @IsNumber()
  @IsOptional()
  taxAmount?: number = 0; // GST/TDS

  @IsNumber()
  @IsOptional()
  penaltyAmount?: number = 0;

  @IsNumber()
  @IsOptional()
  discountAmount?: number = 0;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod = PaymentMethod.RAZORPAY;

  @IsString()
  @IsOptional()
  gatewayRef?: string;
}
