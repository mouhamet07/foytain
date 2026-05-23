import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContributionDto, MarkPaidDto } from './dto/create-contribution.dto';
import { ContributionStatus, MembershipStatus, Prisma } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ContributionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateContributionDto) {
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_tontineId: { userId: dto.userId, tontineId: dto.tontineId },
      },
    });

    if (!membership || membership.status !== MembershipStatus.ACTIVE) {
      throw new BadRequestException('L\'utilisateur n\'est pas membre actif de cette tontine');
    }

    return this.prisma.contribution.create({
      data: {
        userId: dto.userId,
        tontineId: dto.tontineId,
        amount: dto.amount,
        dueDate: new Date(dto.dueDate),
        periodLabel: dto.periodLabel,
        notes: dto.notes,
        status: ContributionStatus.UNPAID,
      },
    });
  }

  async generateForPeriod(tontineId: string, periodLabel: string, dueDate: string) {
    const tontine = await this.prisma.tontine.findUnique({
      where: { id: tontineId },
      include: {
        memberships: { where: { status: MembershipStatus.ACTIVE } },
      },
    });

    if (!tontine) throw new NotFoundException('Tontine introuvable');
    if (tontine.memberships.length === 0) {
      throw new BadRequestException('Aucun membre actif dans cette tontine');
    }

    const contributions: Prisma.ContributionCreateManyInput[] = tontine.memberships.map((m) => ({
      userId: m.userId,
      tontineId,
      amount: tontine.contributionAmount,
      dueDate: new Date(dueDate),
      periodLabel,
      status: ContributionStatus.UNPAID,
      currency: tontine.currency,
    }));

    return this.prisma.contribution.createMany({ data: contributions, skipDuplicates: true });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    userId?: string;
    tontineId?: string;
    status?: ContributionStatus;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.ContributionWhereInput = {};
    if (query.userId) where.userId = query.userId;
    if (query.tontineId) where.tontineId = query.tontineId;
    if (query.status) where.status = query.status;

    const [contributions, total] = await Promise.all([
      this.prisma.contribution.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dueDate: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          tontine: { select: { id: true, name: true, slug: true } },
          payment: { select: { id: true, status: true, method: true } },
        },
      }),
      this.prisma.contribution.count({ where }),
    ]);

    return {
      data: contributions,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findMyContributions(
    userId: string,
    query: { tontineId?: string; status?: ContributionStatus; page?: number; limit?: number },
  ) {
    return this.findAll({ ...query, userId });
  }

  async markAsPaid(id: string, dto: MarkPaidDto) {
    const contribution = await this.prisma.contribution.findUnique({
      where: { id },
      include: { tontine: { select: { name: true } } },
    });
    if (!contribution) throw new NotFoundException('Cotisation introuvable');
    if (contribution.status === ContributionStatus.PAID) {
      throw new BadRequestException('Cette cotisation est déjà payée');
    }

    const updated = await this.prisma.contribution.update({
      where: { id },
      data: {
        status: ContributionStatus.PAID,
        paidAt: new Date(),
        paymentId: dto.paymentId,
      },
    });

    await this.notificationsService.create({
      userId: contribution.userId,
      tontineId: contribution.tontineId,
      type: 'CONTRIBUTION_PAID',
      title: 'Cotisation confirmée',
      message: `Votre cotisation de ${contribution.amount} XOF pour "${contribution.tontine.name}" (${contribution.periodLabel}) a été confirmée`,
    });

    return updated;
  }

  async getStats(tontineId: string) {
    const [total, paid, unpaid, late, totalAmount] = await Promise.all([
      this.prisma.contribution.count({ where: { tontineId } }),
      this.prisma.contribution.count({ where: { tontineId, status: ContributionStatus.PAID } }),
      this.prisma.contribution.count({ where: { tontineId, status: ContributionStatus.UNPAID } }),
      this.prisma.contribution.count({ where: { tontineId, status: ContributionStatus.LATE } }),
      this.prisma.contribution.aggregate({
        where: { tontineId, status: ContributionStatus.PAID },
        _sum: { amount: true },
      }),
    ]);

    return {
      total,
      paid,
      unpaid,
      late,
      totalCollected: Number(totalAmount._sum.amount ?? 0),
    };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async markLateContributions() {
    // Fetch before updating to guarantee we notify exactly the right records
    const toMark = await this.prisma.contribution.findMany({
      where: {
        status: ContributionStatus.UNPAID,
        dueDate: { lt: new Date() },
      },
      include: { tontine: { select: { name: true } } },
      take: 500,
    });

    if (toMark.length === 0) return;

    await this.prisma.contribution.updateMany({
      where: { id: { in: toMark.map((c) => c.id) } },
      data: { status: ContributionStatus.LATE },
    });

    const notifications = toMark.map((c) => ({
      userId: c.userId,
      tontineId: c.tontineId,
      type: 'CONTRIBUTION_LATE' as const,
      title: 'Cotisation en retard',
      message: `Votre cotisation de ${c.amount} XOF pour "${c.tontine.name}" est en retard`,
    }));

    await this.notificationsService.createBulk(notifications);
  }
}
