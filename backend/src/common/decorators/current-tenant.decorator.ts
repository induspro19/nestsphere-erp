import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const CurrentTenant = createParamDecorator(
  (data: { optional?: boolean } | undefined, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest();
    const societyId = request.user?.societyId || request.headers['x-society-id'];

    if (!societyId && !data?.optional) {
      return null;
    }

    return societyId || null;
  },
);
