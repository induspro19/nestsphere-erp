import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface RequestWithCorrelation extends Request {
  requestId?: string;
  correlationId?: string;
}

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: RequestWithCorrelation, res: Response, next: NextFunction) {
    const requestId = (req.headers['x-request-id'] as string) || uuidv4();
    const correlationId = (req.headers['x-correlation-id'] as string) || requestId;

    req.requestId = requestId;
    req.correlationId = correlationId;

    res.setHeader('x-request-id', requestId);
    res.setHeader('x-correlation-id', correlationId);

    next();
  }
}
