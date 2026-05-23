import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MembershipsService } from './memberships.service';
import { JoinTontineDto, InviteMemberDto } from './dto/create-membership.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MembershipStatus } from '@prisma/client';

@ApiTags('Memberships')
@Controller('memberships')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  @Post('join')
  @ApiOperation({ summary: 'Join a tontine' })
  join(@CurrentUser('id') userId: string, @Body() dto: JoinTontineDto) {
    return this.membershipsService.join(userId, dto);
  }

  @Get('tontine/:tontineId')
  @ApiOperation({ summary: 'Get members of a tontine' })
  getMembers(
    @Param('tontineId') tontineId: string,
    @Query('status') status?: MembershipStatus,
  ) {
    return this.membershipsService.getTontineMemberships(tontineId, status);
  }

  @Post('tontine/:tontineId/invite')
  @ApiOperation({ summary: 'Invite a member to a tontine' })
  invite(
    @Param('tontineId') tontineId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.membershipsService.invite(tontineId, userId, dto);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve a membership request' })
  approve(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.membershipsService.approve(id, userId);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject a membership request' })
  reject(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.membershipsService.reject(id, userId);
  }

  @Delete('tontine/:tontineId/leave')
  @ApiOperation({ summary: 'Leave a tontine' })
  leave(@Param('tontineId') tontineId: string, @CurrentUser('id') userId: string) {
    return this.membershipsService.leave(tontineId, userId);
  }
}
