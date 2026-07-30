import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const CurrentTenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const societyId = request.user?.societyId || request.headers['x-society-id'];

    if (!societyId) {
      throw new UnauthorizedException('Tenant context (societyId) missing');
    }

    return societyId;
  },
);
