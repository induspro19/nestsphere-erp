import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
      ],
    });
  }

  log(message: string, context?: string, correlationId?: string) {
    this.logger.info(message, { context, correlationId });
  }

  error(message: string, trace?: string, context?: string, correlationId?: string) {
    this.logger.error(message, { trace, context, correlationId });
  }

  warn(message: string, context?: string, correlationId?: string) {
    this.logger.warn(message, { context, correlationId });
  }

  debug(message: string, context?: string, correlationId?: string) {
    this.logger.debug(message, { context, correlationId });
  }

  logAuth(message: string, meta?: any) {
    this.logger.info(`[AUTH] ${message}`, { category: 'AUTH', ...meta });
  }

  logSecurity(message: string, meta?: any) {
    this.logger.warn(`[SECURITY] ${message}`, { category: 'SECURITY', ...meta });
  }
}
