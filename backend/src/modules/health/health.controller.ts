import { Audit } from '../../common/decorators/audit.decorator';
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';

@ApiTags('Health & Monitoring')
@Audit()
@Controller()
export class HealthController {
  private readonly startTime = Date.now();

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  @Get('health')
  @ApiOperation({ summary: 'System Health Check' })
  @ApiResponse({ status: 200, description: 'Health status of core database and cache services' })
  async checkHealth() {
    let dbStatus = 'down';
    let redisStatus = 'down';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = 'up';
    } catch {
      dbStatus = 'down';
    }

    try {
      await this.redis.set('health_check', 'ok', 10);
      const res = await this.redis.get('health_check');
      if (res === 'ok') redisStatus = 'up';
    } catch {
      redisStatus = 'down';
    }

    return {
      status: dbStatus === 'up' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        redis: redisStatus,
      },
    };
  }

  @Get('version')
  @ApiOperation({ summary: 'API Version Metadata' })
  @ApiResponse({ status: 200, description: 'Software version and build specifications' })
  getVersion() {
    return {
      name: 'Society Management ERP SaaS Platform',
      version: '1.0.0',
      apiVersion: 'v1',
      environment: process.env.NODE_ENV || 'development',
      buildTimestamp: new Date().toISOString(),
    };
  }

  @Get('status')
  @ApiOperation({ summary: 'Runtime Environment Status & Performance' })
  @ApiResponse({ status: 200, description: 'Uptime, CPU, and Memory usage metrics' })
  getStatus() {
    const memoryUsage = process.memoryUsage();
    return {
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        rssMB: Math.round((memoryUsage.rss / 1024 / 1024) * 100) / 100,
        heapTotalMB: Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100,
        heapUsedMB: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
      },
    };
  }
}
