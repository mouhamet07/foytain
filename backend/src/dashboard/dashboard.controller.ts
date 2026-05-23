import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('global')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get global platform statistics (admin)' })
  getGlobalStats() {
    return this.dashboardService.getGlobalStats();
  }

  @Get('user')
  @ApiOperation({ summary: 'Get current user dashboard' })
  getUserDashboard(@CurrentUser('id') userId: string) {
    return this.dashboardService.getUserDashboard(userId);
  }

  @Get('tontine/:tontineId')
  @ApiOperation({ summary: 'Get tontine-specific dashboard' })
  getTontineDashboard(@Param('tontineId') tontineId: string) {
    return this.dashboardService.getTontineDashboard(tontineId);
  }
}
