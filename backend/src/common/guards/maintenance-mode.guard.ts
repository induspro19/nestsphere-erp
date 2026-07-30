import { Injectable, CanActivate, ExecutionContext, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MaintenanceModeGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Super Admin can always bypass maintenance mode
    if (user?.roles?.includes('SUPER_ADMIN')) {
      return true;
    }

    const societyId = user?.societyId || request.headers['x-society-id'];
    if (!societyId) {
      return true;
    }

    try {
      const maintenanceSetting = await this.prisma.setting.findFirst({
        where: {
          societyId,
          domain: 'SECURITY',
          key: 'MAINTENANCE_MODE',
        },
      });

      if (maintenanceSetting && (maintenanceSetting.value as any)?.enabled === true) {
        throw new ServiceUnavailableException(
          'System is currently undergoing scheduled maintenance. Please try again later.',
        );
      }
    } catch (err) {
      if (err instanceof ServiceUnavailableException) {
        throw err;
      }
    }

    return true;
  }
}
