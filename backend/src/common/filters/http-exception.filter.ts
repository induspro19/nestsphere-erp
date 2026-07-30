import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    const requestId = request.headers['x-request-id'] || 'system-generated';

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse: any =
      exception instanceof HttpException ? exception.getResponse() : null;

    const message =
      typeof exceptionResponse === 'object' && exceptionResponse?.message
        ? exceptionResponse.message
        : exception?.message || 'Internal server error';

    let code = 'ERR_500';
    if (status === 401) code = 'AUTH_001';
    else if (status === 403) code = 'AUTH_002';
    else if (status === 404) code = 'ERR_404';
    else if (status === 400) code = 'ERR_400';
    else if (status === 409) code = 'ERR_409';

    if (request.url.includes('/financial')) code = 'FIN_001';
    if (request.url.includes('/complaints')) code = 'CMP_001';

    this.logger.error(`[${requestId}] ${status} - ${message}`);

    response.status(status).json({
      success: false,
      statusCode: status,
      code,
      message,
      requestId,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: exception?.name || 'Error',
    });
  }
}
