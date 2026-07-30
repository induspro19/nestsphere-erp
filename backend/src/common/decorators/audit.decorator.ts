import { UseInterceptors } from '@nestjs/common';
import { AuditLogInterceptor } from '../interceptors/audit-log.interceptor';

export function Audit() {
  return UseInterceptors(AuditLogInterceptor);
}
