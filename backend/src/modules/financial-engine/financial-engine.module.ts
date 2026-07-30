import { Module } from '@nestjs/common';
import { FinancialEngineService } from './financial-engine.service';
import { FinancialEngineController } from './financial-engine.controller';

@Module({
  controllers: [FinancialEngineController],
  providers: [FinancialEngineService],
  exports: [FinancialEngineService],
})
export class FinancialEngineModule {}
