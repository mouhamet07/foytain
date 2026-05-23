import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVoteDto } from './dto/create-vote.dto';
import { MedicalRequestStatus, MembershipStatus, VoteChoice } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class VotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async cast(userId: string, dto: CreateVoteDto) {
    const request = await this.prisma.medicalRequest.findUnique({
      where: { id: dto.medicalRequestId },
    });

    if (!request) throw new NotFoundException('Demande médicale introuvable');

    if (
      request.status !== MedicalRequestStatus.PENDING &&
      request.status !== MedicalRequestStatus.UNDER_REVIEW
    ) {
      throw new BadRequestException('Le vote est clôturé pour cette demande');
    }

    if (request.votingDeadline && request.votingDeadline < new Date()) {
      throw new BadRequestException('La date limite de vote est dépassée');
    }

    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_tontineId: { userId, tontineId: request.tontineId },
      },
    });

    if (!membership || membership.status !== MembershipStatus.ACTIVE) {
      throw new ForbiddenException('Seuls les membres actifs peuvent voter');
    }

    if (request.userId === userId) {
      throw new ForbiddenException('Vous ne pouvez pas voter pour votre propre demande');
    }

    const existing = await this.prisma.vote.findUnique({
      where: {
        userId_medicalRequestId: { userId, medicalRequestId: dto.medicalRequestId },
      },
    });

    if (existing) throw new ConflictException('Vous avez déjà voté pour cette demande');

    const vote = await this.prisma.vote.create({
      data: {
        userId,
        medicalRequestId: dto.medicalRequestId,
        choice: dto.choice,
        comment: dto.comment ?? null,
      },
    });

    // Check auto-close after vote
    await this.checkAndCloseVoting(dto.medicalRequestId, request.tontineId, request.userId);

    return vote;
  }

  private async checkAndCloseVoting(
    requestId: string,
    tontineId: string,
    requesterId: string,
  ) {
    const [activeMembers, votes] = await Promise.all([
      this.prisma.membership.count({
        where: { tontineId, status: MembershipStatus.ACTIVE },
      }),
      this.prisma.vote.findMany({
        where: { medicalRequestId: requestId },
        select: { choice: true },
      }),
    ]);

    const eligibleVoters = activeMembers - 1; // Exclude requester
    const forVotes = votes.filter((v) => v.choice === VoteChoice.FOR).length;
    const againstVotes = votes.filter((v) => v.choice === VoteChoice.AGAINST).length;

    if (eligibleVoters <= 0) return;

    if (forVotes > eligibleVoters / 2) {
      await this.prisma.medicalRequest.update({
        where: { id: requestId },
        data: { status: MedicalRequestStatus.APPROVED },
      });
      await this.notificationsService.create({
        userId: requesterId,
        tontineId,
        type: 'MEDICAL_REQUEST_APPROVED',
        title: 'Demande approuvée par vote',
        message: `Votre demande a été approuvée par la communauté (${forVotes} votes POUR)`,
      });
    } else if (againstVotes > eligibleVoters / 2) {
      await this.prisma.medicalRequest.update({
        where: { id: requestId },
        data: {
          status: MedicalRequestStatus.REJECTED,
          rejectionReason: 'Rejeté par vote communautaire',
        },
      });
      await this.notificationsService.create({
        userId: requesterId,
        tontineId,
        type: 'MEDICAL_REQUEST_REJECTED',
        title: 'Demande refusée par vote',
        message: `Votre demande a été refusée par la communauté (${againstVotes} votes CONTRE)`,
      });
    }
  }

  async getVotesForRequest(medicalRequestId: string) {
    const votes = await this.prisma.vote.findMany({
      where: { medicalRequestId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const stats = {
      for: votes.filter((v) => v.choice === VoteChoice.FOR).length,
      against: votes.filter((v) => v.choice === VoteChoice.AGAINST).length,
      abstain: votes.filter((v) => v.choice === VoteChoice.ABSTAIN).length,
      total: votes.length,
    };

    return { votes, stats };
  }

  async getUserVote(userId: string, medicalRequestId: string) {
    return this.prisma.vote.findUnique({
      where: { userId_medicalRequestId: { userId, medicalRequestId } },
    });
  }
}
