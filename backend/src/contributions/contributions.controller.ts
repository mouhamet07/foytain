import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ContributionsService } from './contributions.service';
import { CreateContributionDto, MarkPaidDto } from './dto/create-contribution.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ContributionStatus, Role } from '@prisma/client';

@ApiTags('Contributions')
@Controller('contributions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ContributionsController {
  constructor(private readonly contributionsService: ContributionsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a contribution record' })
  create(@Body() dto: CreateContributionDto) {
    return this.contributionsService.create(dto);
  }

  @Post('generate')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Generate contributions for a tontine period' })
  generate(@Body() body: { tontineId: string; periodLabel: string; dueDate: string }) {
    return this.contributionsService.generateForPeriod(body.tontineId, body.periodLabel, body.dueDate);
  }

  @Get()
  @ApiOperation({ summary: 'List contributions' })
  findAll(
    @Query() query: {
      page?: number;
      limit?: number;
      tontineId?: string;
      userId?: string;
      status?: ContributionStatus;
    },
  ) {
    return this.contributionsService.findAll(query);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my contributions' })
  getMyContributions(
    @CurrentUser('id') userId: string,
    @Query() query: { tontineId?: string; status?: ContributionStatus },
  ) {
    return this.contributionsService.findMyContributions(userId, query);
  }

  @Get('stats/:tontineId')
  @ApiOperation({ summary: 'Get contribution stats for a tontine' })
  getStats(@Param('tontineId') tontineId: string) {
    return this.contributionsService.getStats(tontineId);
  }

  @Patch(':id/pay')
  @ApiOperation({ summary: 'Mark contribution as paid' })
  markAsPaid(@Param('id') id: string, @Body() dto: MarkPaidDto) {
    return this.contributionsService.markAsPaid(id, dto);
  }
}
