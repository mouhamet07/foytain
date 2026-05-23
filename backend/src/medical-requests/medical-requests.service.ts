import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicalRequestDto, ReviewMedicalRequestDto } from './dto/create-medical-request.dto';
import { MedicalRequestStatus, MembershipStatus, Prisma } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class MedicalRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(userId: string, dto: CreateMedicalRequestDto) {
    const membership = await this.prisma.membership.findUnique({
      where: { userId_tontineId: { userId, tontineId: dto.tontineId } },
    });

    if (!membership || membership.status !== MembershipStatus.ACTIVE) {
      throw new ForbiddenException(
        'Vous devez être membre actif de la tontine pour soumettre une demande',
      );
    }

    const tontine = await this.prisma.tontine.findUnique({ where: { id: dto.tontineId } });
    if (!tontine) throw new NotFoundException('Tontine introuvable');

    const votingDeadline = dto.votingDeadline
      ? new Date(dto.votingDeadline)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const request = await this.prisma.medicalRequest.create({
      data: {
        userId,
        tontineId: dto.tontineId,
        title: dto.title,
        description: dto.description,
        amount: dto.amount,
        diagnosis: dto.diagnosis ?? null,
        hospitalName: dto.hospitalName ?? null,
        votingDeadline,
        status: MedicalRequestStatus.PENDING,
      },
    });

    // Notify all tontine members except the requester
    const members = await this.prisma.membership.findMany({
      where: { tontineId: dto.tontineId, status: MembershipStatus.ACTIVE },
      select: { userId: true },
    });

    const notifications = members
      .filter((m) => m.userId !== userId)
      .map((m) => ({
        userId: m.userId,
        tontineId: dto.tontineId,
        type: 'MEDICAL_REQUEST_CREATED' as const,
        title: 'Nouvelle demande d\'aide médicale',
        message: `Un membre de "${tontine.name}" demande une aide de ${dto.amount} XOF`,
      }));

    if (notifications.length > 0) {
      await this.notificationsService.createBulk(notifications);
    }

    return request;
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    tontineId?: string;
    userId?: string;
    status?: MedicalRequestStatus;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.MedicalRequestWhereInput = {};
    if (query.tontineId) where.tontineId = query.tontineId;
    if (query.userId) where.userId = query.userId;
    if (query.status) where.status = query.status;

    const [requests, total] = await Promise.all([
      this.prisma.medicalRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          tontine: { select: { id: true, name: true, slug: true } },
          _count: { select: { votes: true } },
          votes: { select: { choice: true } },
        },
      }),
      this.prisma.medicalRequest.count({ where }),
    ]);

    // Compute vote stats inline
    const data = requests.map((r) => {
      const voteStats = {
        for: r.votes.filter((v) => v.choice === 'FOR').length,
        against: r.votes.filter((v) => v.choice === 'AGAINST').length,
        abstain: r.votes.filter((v) => v.choice === 'ABSTAIN').length,
      };
      const { votes, ...rest } = r;
      return { ...rest, voteStats };
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const request = await this.prisma.medicalRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true, email: true },
        },
        tontine: { select: { id: true, name: true, slug: true } },
        votes: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { votes: true } },
      },
    });

    if (!request) throw new NotFoundException('Demande médicale introuvable');

    const voteStats = {
      for: request.votes.filter((v) => v.choice === 'FOR').length,
      against: request.votes.filter((v) => v.choice === 'AGAINST').length,
      abstain: request.votes.filter((v) => v.choice === 'ABSTAIN').length,
    };

    return { ...request, voteStats };
  }

  async addDocuments(id: string, userId: string, files: Express.Multer.File[]) {
    const request = await this.prisma.medicalRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException('Demande médicale introuvable');
    if (request.userId !== userId) {
      throw new ForbiddenException('Vous ne pouvez pas modifier cette demande');
    }
    if (request.status !== MedicalRequestStatus.PENDING) {
      throw new BadRequestException('Impossible d\'ajouter des documents à une demande déjà traitée');
    }

    const uploadResults = await Promise.all(
      files.map((f) => this.cloudinaryService.uploadDocument(f, 'medical-docs')),
    );
    const urls = uploadResults.map((r) => r.secure_url);

    return this.prisma.medicalRequest.update({
      where: { id },
      data: { documentUrls: { push: urls } },
    });
  }

  async approve(id: string, _adminUserId: string) {
    const request = await this.prisma.medicalRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException('Demande médicale introuvable');

    if (
      request.status !== MedicalRequestStatus.PENDING &&
      request.status !== MedicalRequestStatus.UNDER_REVIEW
    ) {
      throw new BadRequestException('Cette demande ne peut plus être approuvée');
    }

    const updated = await this.prisma.medicalRequest.update({
      where: { id },
      data: { status: MedicalRequestStatus.APPROVED },
    });

    await this.notificationsService.create({
      userId: request.userId,
      tontineId: request.tontineId,
      type: 'MEDICAL_REQUEST_APPROVED',
      title: 'Demande approuvée',
      message: `Votre demande d'aide de ${request.amount} XOF a été approuvée`,
    });

    return updated;
  }

  async reject(id: string, _adminUserId: string, dto: ReviewMedicalRequestDto) {
    const request = await this.prisma.medicalRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException('Demande médicale introuvable');

    const updated = await this.prisma.medicalRequest.update({
      where: { id },
      data: {
        status: MedicalRequestStatus.REJECTED,
        rejectionReason: dto.rejectionReason ?? null,
      },
    });

    await this.notificationsService.create({
      userId: request.userId,
      tontineId: request.tontineId,
      type: 'MEDICAL_REQUEST_REJECTED',
      title: 'Demande refusée',
      message: `Votre demande médicale a été refusée${dto.rejectionReason ? ` : ${dto.rejectionReason}` : ''}`,
    });

    return updated;
  }
}
