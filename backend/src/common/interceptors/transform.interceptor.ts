import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponseEnvelope<T> {
  success: boolean;
  statusCode: number;
  message?: string;
  data: T;
  meta?: any;
  timestamp: string;
  requestId: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ResponseEnvelope<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseEnvelope<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const statusCode = response.statusCode;
    const requestId = request.headers['x-request-id'] || 'system-generated';

    return next.handle().pipe(
      map((result) => {
        // If result is already structured with data/meta
        if (result && typeof result === 'object' && 'data' in result) {
          return {
            success: true,
            statusCode,
            message: result.message || 'Success',
            data: result.data,
            meta: result.meta,
            timestamp: new Date().toISOString(),
            requestId,
          };
        }
        return {
          success: true,
          statusCode,
          message: 'Success',
          data: result,
          timestamp: new Date().toISOString(),
          requestId,
        };
      }),
    );
  }
}
