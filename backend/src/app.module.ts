import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './common/prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';
import { LoggerModule } from './common/logger/logger.module';
import { AuthModule } from './modules/auth/auth.module';
import { SettingsModule } from './modules/settings/settings.module';
import { PropertyManagementModule } from './modules/property-management/property-management.module';
import { PeopleManagementModule } from './modules/people-management/people-management.module';
import { AccessControlModule } from './modules/access-control/access-control.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { WorkflowEngineModule } from './modules/workflow-engine/workflow-engine.module';
import { AssetManagementModule } from './modules/asset-management/asset-management.module';
import { VisitorManagementModule } from './modules/visitor-management/visitor-management.module';
import { DocumentManagementModule } from './modules/document-management/document-management.module';
import { FinancialEngineModule } from './modules/financial-engine/financial-engine.module';
import { AnalyticsEngineModule } from './modules/analytics-engine/analytics-engine.module';
import { ComplaintsModule } from './modules/complaints/complaints.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { MaintenanceBillingModule } from './modules/maintenance-billing/maintenance-billing.module';
import { AmenityBookingModule } from './modules/amenity-booking/amenity-booking.module';
import { ParkingManagementModule } from './modules/parking-management/parking-management.module';
import { VendorAmcModule } from './modules/vendor-amc/vendor-amc.module';
import { MeetingsModule } from './modules/meetings/meetings.module';
import { NoticesModule } from './modules/notices/notices.module';
import { SuperAdminModule } from './modules/super-admin/super-admin.module';
import { PaymentModule } from './modules/payment/payment.module';
import { PollsModule } from './modules/polls/polls.module';
import { HealthController } from './modules/health/health.controller';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        name: 'global',
        ttl: 60000,
        limit: 100,
      },
      {
        name: 'login',
        ttl: 60000,
        limit: 5,
      },
      {
        name: 'otp',
        ttl: 60000,
        limit: 3,
      },
    ]),
    PrismaModule,
    RedisModule,
    LoggerModule,
    AuthModule,
    SettingsModule,
    PropertyManagementModule,
    PeopleManagementModule,
    AccessControlModule,
    NotificationsModule,
    WorkflowEngineModule,
    AssetManagementModule,
    VisitorManagementModule,
    DocumentManagementModule,
    FinancialEngineModule,
    AnalyticsEngineModule,
    ComplaintsModule,
    MaintenanceModule,
    MaintenanceBillingModule,
    AmenityBookingModule,
    ParkingManagementModule,
    VendorAmcModule,
    MeetingsModule,
    NoticesModule,
    SuperAdminModule,
    PaymentModule,
    PollsModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
