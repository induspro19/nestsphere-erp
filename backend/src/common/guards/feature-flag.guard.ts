import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FEATURE_FLAG_KEY } from '../decorators/feature-flag.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeatureFlagGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFeature = this.reflector.getAllAndOverride<string>(FEATURE_FLAG_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredFeature) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Super Admin bypasses feature flag locks
    if (user?.roles?.includes('SUPER_ADMIN')) {
      return true;
    }

    const societyId = user?.societyId || request.headers['x-society-id'];
    if (!societyId) {
      throw new ForbiddenException(`Feature '${requiredFeature}' is locked: Tenant context missing`);
    }

    // Lookup active subscription plan features for tenant
    const activeSub = await this.prisma.societySubscription.findFirst({
      where: { societyId, status: { in: ['TRIAL', 'ACTIVE'] } },
      include: {
        plan: {
          include: {
            features: {
              include: { feature: true },
            },
          },
        },
      },
    });

    if (!activeSub) {
      throw new ForbiddenException(`Feature '${requiredFeature}' is locked: No active subscription plan`);
    }

    const hasFeature = activeSub.plan.features.some(
      (pf) => pf.feature.code === requiredFeature,
    );

    if (!hasFeature) {
      throw new ForbiddenException(`Feature '${requiredFeature}' is not included in your current ${activeSub.plan.name} subscription plan`);
    }

    return true;
  }
}
