import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { RazorpayAdapter } from './adapters/razorpay.adapter';
import { MockPaymentAdapter } from './adapters/mock.adapter';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { FinancialEngineModule } from '../financial-engine/financial-engine.module';
import { MaintenanceBillingModule } from '../maintenance-billing/maintenance-billing.module';

@Global()
@Module({
  imports: [ConfigModule, PrismaModule, FinancialEngineModule, MaintenanceBillingModule],
  controllers: [PaymentController],
  providers: [
    {
      provide: 'PAYMENT_ADAPTER',
      useFactory: (configService: ConfigService) => {
        const provider = configService.get<string>('PAYMENT_PROVIDER') || 'mock';
        if (provider.toLowerCase() === 'razorpay') {
          return new RazorpayAdapter(configService);
        }
        return new MockPaymentAdapter();
      },
      inject: [ConfigService],
    },
    PaymentService,
  ],
  exports: [PaymentService],
})
export class PaymentModule {}
