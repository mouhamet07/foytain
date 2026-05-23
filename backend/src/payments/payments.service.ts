import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentStatus, ContributionStatus, Prisma } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(userId: string, dto: CreatePaymentDto) {
    const payment = await this.prisma.payment.create({
      data: {
        userId,
        amount: dto.amount,
        currency: dto.currency ?? 'XOF',
        method: dto.method,
        description: dto.description ?? null,
        status: PaymentStatus.PENDING,
      },
    });

    if (dto.contributionId) {
      await this.prisma.contribution.update({
        where: { id: dto.contributionId },
        data: { paymentId: payment.id },
      });
    }

    return payment;
  }

  async complete(paymentId: string, transactionId?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { contribution: true },
    });

    if (!payment) throw new NotFoundException('Paiement introuvable');
    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Ce paiement n\'est pas en statut PENDING');
    }

    const updated = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.COMPLETED,
        transactionId: transactionId ?? null,
        processedAt: new Date(),
      },
    });

    // Mark linked contribution as paid
    if (payment.contribution) {
      await this.prisma.contribution.update({
        where: { id: payment.contribution.id },
        data: { status: ContributionStatus.PAID, paidAt: new Date() },
      });
    }

    await this.notificationsService.create({
      userId: payment.userId,
      type: 'PAYMENT_RECEIVED',
      title: 'Paiement confirmé',
      message: `Votre paiement de ${payment.amount} ${payment.currency} a été confirmé`,
    });

    return updated;
  }

  async fail(paymentId: string, reason?: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException('Paiement introuvable');
    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Ce paiement n\'est pas en statut PENDING');
    }

    const updated = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.FAILED,
        failureReason: reason ?? null,
      },
    });

    await this.notificationsService.create({
      userId: payment.userId,
      type: 'PAYMENT_FAILED',
      title: 'Paiement échoué',
      message: `Votre paiement de ${payment.amount} ${payment.currency} a échoué${reason ? ` : ${reason}` : ''}`,
    });

    return updated;
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    userId?: string;
    status?: PaymentStatus;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.PaymentWhereInput = {};
    if (query.userId) where.userId = query.userId;
    if (query.status) where.status = query.status;

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
          contribution: {
            include: { tontine: { select: { id: true, name: true } } },
          },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data: payments,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        contribution: {
          include: { tontine: { select: { id: true, name: true } } },
        },
      },
    });
    if (!payment) throw new NotFoundException('Paiement introuvable');
    return payment;
  }
}
