import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Super Admin has multi-tenant cross-society access
    if (user?.roles?.includes('SUPER_ADMIN')) {
      return true;
    }

    const requestTenantId = request.headers['x-society-id'] || request.params.societyId || request.body?.societyId;
    
    if (user?.societyId && requestTenantId && user.societyId !== requestTenantId) {
      throw new ForbiddenException('Multi-Tenant Access Violation: Cannot access data belonging to another society');
    }

    return true;
  }
}
