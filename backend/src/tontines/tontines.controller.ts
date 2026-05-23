import {
  Controller, Get, Post, Put, Patch, Delete, Body, Param,
  Query, UseGuards, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TontinesService } from './tontines.service';
import { CreateTontineDto } from './dto/create-tontine.dto';
import { UpdateTontineDto } from './dto/update-tontine.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@ApiTags('Tontines')
@Controller('tontines')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class TontinesController {
  constructor(
    private readonly tontinesService: TontinesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tontine' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateTontineDto) {
    return this.tontinesService.create(userId, dto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all tontines (with filters)' })
  findAll(@Query() query: { page?: number; limit?: number; search?: string; type?: string; status?: string }) {
    return this.tontinesService.findAll(query);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get tontines where user is a member' })
  getMyTontines(@CurrentUser('id') userId: string) {
    return this.tontinesService.getUserTontines(userId);
  }

  @Get(':idOrSlug')
  @Public()
  @ApiOperation({ summary: 'Get tontine by ID or slug' })
  findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.tontinesService.findOne(idOrSlug);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update tontine' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateTontineDto,
  ) {
    return this.tontinesService.update(id, userId, dto);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate a tontine' })
  activate(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.tontinesService.activate(id, userId);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a tontine' })
  cancel(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.tontinesService.cancel(id, userId);
  }

  @Patch(':id/cover')
  @UseInterceptors(FileInterceptor('cover'))
  @ApiOperation({ summary: 'Upload tontine cover image' })
  async uploadCover(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.cloudinaryService.uploadImage(file, 'tontine-covers');
    return this.tontinesService.uploadCover(id, userId, result.secure_url);
  }
}
