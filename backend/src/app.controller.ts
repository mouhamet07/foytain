import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from './prisma/prisma.service';
import { Public } from './common/decorators/public.decorator';
import { SkipThrottle } from '@nestjs/throttler';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  @Public()
  @SkipThrottle()
  @ApiOperation({ summary: 'Health check endpoint' })
  async health() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        service: 'Foytain API',
        database: 'connected',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      };
    } catch {
      return {
        status: 'degraded',
        service: 'Foytain API',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
