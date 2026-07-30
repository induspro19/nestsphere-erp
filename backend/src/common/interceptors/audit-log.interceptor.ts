import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    // Only audit mutating state requests (POST, PUT, PATCH, DELETE)
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return next.handle();
    }

    const user = request.user;
    const ip = request.ip || request.headers['x-forwarded-for'] || '127.0.0.1';
    const userAgent = request.headers['user-agent'] || '';
    const requestId = request.headers['x-request-id'] || 'N/A';
    const correlationId = request.headers['x-correlation-id'] || 'N/A';

    return next.handle().pipe(
      tap(async () => {
        try {
          if (user?.sub) {
            await this.prisma.auditLog.create({
              data: {
                societyId: user.societyId || null,
                userId: user.sub,
                action: method,
                entity: request.route?.path || 'API',
                ipAddress: String(ip),
                device: userAgent.includes('Mobi') ? 'Mobile' : 'Desktop',
                browser: userAgent.substring(0, 99),
                changes: {
                  requestId,
                  correlationId,
                  oldValue: null,
                  newValue: null,
                },
              },
            });
          }
        } catch {
          // Silent catch to prevent audit failure from breaking main request
        }
      }),
    );
  }
}
