import { Controller, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, TontineStatus } from '@prisma/client';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@ApiBearerAuth('JWT-auth')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Admin overview stats' })
  getOverview() {
    return this.adminService.getOverview();
  }

  @Get('users')
  @ApiOperation({ summary: 'List users (admin)' })
  getUsers(@Query() query: { page?: number; limit?: number; search?: string; role?: Role }) {
    return this.adminService.getUsers(query);
  }

  @Patch('users/:id/role')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update user role (super admin)' })
  updateRole(@Param('id') id: string, @Body() body: { role: Role }) {
    return this.adminService.updateUserRole(id, body.role);
  }

  @Patch('users/:id/toggle-active')
  @ApiOperation({ summary: 'Toggle user active status' })
  toggleActive(@Param('id') id: string) {
    return this.adminService.toggleUserActive(id);
  }

  @Get('tontines')
  @ApiOperation({ summary: 'List tontines (admin)' })
  getTontines(@Query() query: { page?: number; limit?: number; status?: TontineStatus }) {
    return this.adminService.getTontines(query);
  }

  @Get('medical-requests/pending')
  @ApiOperation({ summary: 'List pending medical requests' })
  getPendingRequests() {
    return this.adminService.getPendingMedicalRequests();
  }
}
