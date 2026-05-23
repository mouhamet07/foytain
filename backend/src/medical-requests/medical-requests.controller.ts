import {
  Controller, Get, Post, Patch, Body, Param, Query,
  UseGuards, UploadedFiles, UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MedicalRequestsService } from './medical-requests.service';
import { CreateMedicalRequestDto, ReviewMedicalRequestDto } from './dto/create-medical-request.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MedicalRequestStatus, Role } from '@prisma/client';

@ApiTags('Medical Requests')
@Controller('medical-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class MedicalRequestsController {
  constructor(private readonly medicalRequestsService: MedicalRequestsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a medical aid request' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateMedicalRequestDto) {
    return this.medicalRequestsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List medical requests' })
  findAll(
    @Query() query: {
      page?: number;
      limit?: number;
      tontineId?: string;
      status?: MedicalRequestStatus;
    },
  ) {
    return this.medicalRequestsService.findAll(query);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my medical requests' })
  getMy(
    @CurrentUser('id') userId: string,
    @Query() query: { tontineId?: string; status?: MedicalRequestStatus },
  ) {
    return this.medicalRequestsService.findAll({ ...query, userId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get medical request details' })
  findOne(@Param('id') id: string) {
    return this.medicalRequestsService.findOne(id);
  }

  @Post(':id/documents')
  @UseInterceptors(FilesInterceptor('documents', 5))
  @ApiOperation({ summary: 'Upload medical documents' })
  uploadDocuments(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.medicalRequestsService.addDocuments(id, userId, files);
  }

  @Patch(':id/approve')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Approve a medical request (admin)' })
  approve(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.medicalRequestsService.approve(id, userId);
  }

  @Patch(':id/reject')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Reject a medical request (admin)' })
  reject(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: ReviewMedicalRequestDto,
  ) {
    return this.medicalRequestsService.reject(id, userId, dto);
  }
}
