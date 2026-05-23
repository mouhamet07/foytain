import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTontineDto } from './dto/create-tontine.dto';
import { UpdateTontineDto } from './dto/update-tontine.dto';
import { TontineStatus, MembershipRole, MembershipStatus, Prisma } from '@prisma/client';

// slug library loaded at runtime to avoid TS resolution issues
// eslint-disable-next-line @typescript-eslint/no-var-requires
const slugify = require('slugify') as (str: string, opts?: object) => string;

@Injectable()
export class TontinesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateTontineDto) {
    const baseSlug = slugify(dto.name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (await this.prisma.tontine.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const tontine = await this.prisma.tontine.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        type: dto.type,
        frequency: dto.frequency,
        contributionAmount: dto.contributionAmount,
        currency: dto.currency ?? 'XOF',
        maxMembers: dto.maxMembers ?? null,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        rules: dto.rules,
        ownerId: userId,
      },
    });

    // Auto-add creator as CREATOR member
    await this.prisma.membership.create({
      data: {
        userId,
        tontineId: tontine.id,
        status: MembershipStatus.ACTIVE,
        role: MembershipRole.CREATOR,
        joinedAt: new Date(),
      },
    });

    return tontine;
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    status?: string;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.TontineWhereInput = {};
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.type) where.type = query.type as any;
    if (query.status) where.status = query.status as any;

    const [tontines, total] = await Promise.all([
      this.prisma.tontine.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: { id: true, firstName: true, lastName: true, avatarUrl: true },
          },
          _count: { select: { memberships: true, contributions: true } },
        },
      }),
      this.prisma.tontine.count({ where }),
    ]);

    return {
      data: tontines,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(idOrSlug: string) {
    const tontine = await this.prisma.tontine.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            email: true,
          },
        },
        memberships: {
          where: { status: MembershipStatus.ACTIVE },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                email: true,
              },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
        _count: {
          select: {
            memberships: true,
            contributions: true,
            medicalRequests: true,
          },
        },
      },
    });

    if (!tontine) throw new NotFoundException('Tontine introuvable');
    return tontine;
  }

  async update(id: string, userId: string, dto: UpdateTontineDto) {
    const tontine = await this.prisma.tontine.findUnique({ where: { id } });
    if (!tontine) throw new NotFoundException('Tontine introuvable');
    if (tontine.ownerId !== userId) {
      throw new ForbiddenException('Seul le créateur peut modifier cette tontine');
    }
    if (
      tontine.status === TontineStatus.FINISHED ||
      tontine.status === TontineStatus.CANCELLED
    ) {
      throw new BadRequestException('Impossible de modifier une tontine terminée ou annulée');
    }

    return this.prisma.tontine.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async activate(id: string, userId: string) {
    const tontine = await this.prisma.tontine.findUnique({ where: { id } });

    if (!tontine) throw new NotFoundException('Tontine introuvable');
    if (tontine.ownerId !== userId) {
      throw new ForbiddenException('Seul le créateur peut activer cette tontine');
    }
    if (tontine.status !== TontineStatus.PENDING) {
      throw new BadRequestException('La tontine n\'est pas en statut PENDING');
    }

    return this.prisma.tontine.update({
      where: { id },
      data: { status: TontineStatus.ACTIVE },
    });
  }

  async cancel(id: string, userId: string) {
    const tontine = await this.prisma.tontine.findUnique({ where: { id } });
    if (!tontine) throw new NotFoundException('Tontine introuvable');
    if (tontine.ownerId !== userId) {
      throw new ForbiddenException('Seul le créateur peut annuler cette tontine');
    }
    if (tontine.status === TontineStatus.FINISHED) {
      throw new BadRequestException('Impossible d\'annuler une tontine déjà terminée');
    }

    return this.prisma.tontine.update({
      where: { id },
      data: { status: TontineStatus.CANCELLED },
    });
  }

  async getUserTontines(userId: string) {
    const memberships = await this.prisma.membership.findMany({
      where: { userId, status: MembershipStatus.ACTIVE },
      include: {
        tontine: {
          include: {
            owner: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
            _count: { select: { memberships: true } },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    return memberships.map((m) => ({ ...m.tontine, memberRole: m.role }));
  }

  async uploadCover(id: string, userId: string, coverImageUrl: string) {
    const tontine = await this.prisma.tontine.findUnique({ where: { id } });
    if (!tontine) throw new NotFoundException('Tontine introuvable');
    if (tontine.ownerId !== userId) {
      throw new ForbiddenException('Seul le créateur peut modifier la couverture');
    }

    return this.prisma.tontine.update({ where: { id }, data: { coverImageUrl } });
  }
}
