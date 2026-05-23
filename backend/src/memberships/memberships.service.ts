import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JoinTontineDto, InviteMemberDto } from './dto/create-membership.dto';
import { MembershipStatus, MembershipRole, TontineType, TontineStatus } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MembershipsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async join(userId: string, dto: JoinTontineDto) {
    const tontine = await this.prisma.tontine.findUnique({ where: { id: dto.tontineId } });
    if (!tontine) throw new NotFoundException('Tontine introuvable');

    if (
      tontine.status === TontineStatus.CANCELLED ||
      tontine.status === TontineStatus.FINISHED
    ) {
      throw new BadRequestException('Cette tontine n\'accepte plus de nouveaux membres');
    }

    const existing = await this.prisma.membership.findUnique({
      where: { userId_tontineId: { userId, tontineId: dto.tontineId } },
    });

    if (existing) {
      if (existing.status === MembershipStatus.ACTIVE) {
        throw new ConflictException('Vous êtes déjà membre de cette tontine');
      }
      if (existing.status === MembershipStatus.PENDING) {
        throw new ConflictException('Votre demande est déjà en attente d\'approbation');
      }
    }

    if (tontine.maxMembers) {
      const activeCount = await this.prisma.membership.count({
        where: { tontineId: dto.tontineId, status: MembershipStatus.ACTIVE },
      });
      if (activeCount >= tontine.maxMembers) {
        throw new BadRequestException('Cette tontine a atteint le nombre maximum de membres');
      }
    }

    if (tontine.type === TontineType.PRIVATE && !dto.invitationToken) {
      throw new ForbiddenException('Cette tontine est privée. Une invitation est requise.');
    }

    let status: MembershipStatus = MembershipStatus.PENDING;

    if (dto.invitationToken) {
      const invitation = await this.prisma.invitation.findUnique({
        where: { token: dto.invitationToken },
      });

      if (!invitation || invitation.tontineId !== dto.tontineId) {
        throw new BadRequestException('Token d\'invitation invalide');
      }
      if (invitation.expiresAt < new Date()) {
        throw new BadRequestException('L\'invitation a expiré');
      }

      status = MembershipStatus.ACTIVE;
      await this.prisma.invitation.update({
        where: { id: invitation.id },
        data: { accepted: true },
      });
    }

    if (tontine.type === TontineType.PUBLIC) {
      status = MembershipStatus.ACTIVE;
    }

    const membership = await this.prisma.membership.create({
      data: {
        userId,
        tontineId: dto.tontineId,
        status,
        role: MembershipRole.MEMBER,
        joinedAt: status === MembershipStatus.ACTIVE ? new Date() : undefined,
      },
    });

    if (status === MembershipStatus.ACTIVE) {
      await this.notificationsService.create({
        userId: tontine.ownerId,
        tontineId: tontine.id,
        type: 'MEMBERSHIP_APPROVED',
        title: 'Nouveau membre',
        message: `Un nouveau membre a rejoint votre tontine "${tontine.name}"`,
      });
    }

    return membership;
  }

  async approve(membershipId: string, adminUserId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: { id: membershipId },
      include: { tontine: true },
    });

    if (!membership) throw new NotFoundException('Demande d\'adhésion introuvable');
    if (membership.status !== MembershipStatus.PENDING) {
      throw new BadRequestException('Cette demande n\'est pas en attente d\'approbation');
    }

    const adminMembership = await this.prisma.membership.findUnique({
      where: {
        userId_tontineId: { userId: adminUserId, tontineId: membership.tontineId },
      },
    });

    const isOwner = membership.tontine.ownerId === adminUserId;
    const isAdminRole =
      adminMembership?.role === MembershipRole.ADMIN ||
      adminMembership?.role === MembershipRole.CREATOR;

    if (!isOwner && !isAdminRole) {
      throw new ForbiddenException('Seuls les administrateurs de la tontine peuvent approuver les membres');
    }

    const updated = await this.prisma.membership.update({
      where: { id: membershipId },
      data: { status: MembershipStatus.ACTIVE, joinedAt: new Date() },
    });

    await this.notificationsService.create({
      userId: membership.userId,
      tontineId: membership.tontineId,
      type: 'MEMBERSHIP_APPROVED',
      title: 'Demande approuvée',
      message: `Votre demande pour rejoindre "${membership.tontine.name}" a été approuvée`,
    });

    return updated;
  }

  async reject(membershipId: string, adminUserId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: { id: membershipId },
      include: { tontine: true },
    });

    if (!membership) throw new NotFoundException('Demande d\'adhésion introuvable');
    if (membership.status !== MembershipStatus.PENDING) {
      throw new BadRequestException('Cette demande n\'est pas en attente d\'approbation');
    }

    const adminMembership = await this.prisma.membership.findUnique({
      where: {
        userId_tontineId: { userId: adminUserId, tontineId: membership.tontineId },
      },
    });

    const isOwner = membership.tontine.ownerId === adminUserId;
    const isAdminRole =
      adminMembership?.role === MembershipRole.ADMIN ||
      adminMembership?.role === MembershipRole.CREATOR;

    if (!isOwner && !isAdminRole) {
      throw new ForbiddenException('Seuls les administrateurs de la tontine peuvent refuser des membres');
    }

    const updated = await this.prisma.membership.update({
      where: { id: membershipId },
      data: { status: MembershipStatus.REJECTED },
    });

    await this.notificationsService.create({
      userId: membership.userId,
      tontineId: membership.tontineId,
      type: 'MEMBERSHIP_REJECTED',
      title: 'Demande refusée',
      message: `Votre demande pour rejoindre "${membership.tontine.name}" a été refusée`,
    });

    return updated;
  }

  async leave(tontineId: string, userId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: { userId_tontineId: { userId, tontineId } },
      include: { tontine: true },
    });

    if (!membership) throw new NotFoundException('Membership introuvable');
    if (membership.status !== MembershipStatus.ACTIVE) {
      throw new BadRequestException('Vous n\'êtes pas membre actif de cette tontine');
    }
    if (membership.role === MembershipRole.CREATOR) {
      throw new ForbiddenException('Le créateur ne peut pas quitter sa propre tontine');
    }

    return this.prisma.membership.update({
      where: { id: membership.id },
      data: { status: MembershipStatus.LEFT, leftAt: new Date() },
    });
  }

  async getTontineMemberships(tontineId: string, status?: MembershipStatus) {
    return this.prisma.membership.findMany({
      where: { tontineId, ...(status ? { status } : {}) },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });
  }

  async invite(tontineId: string, senderId: string, dto: InviteMemberDto) {
    if (!dto.userId && !dto.email) {
      throw new BadRequestException('Veuillez spécifier un utilisateur ou une adresse email');
    }

    const tontine = await this.prisma.tontine.findUnique({ where: { id: tontineId } });
    if (!tontine) throw new NotFoundException('Tontine introuvable');
    if (tontine.ownerId !== senderId) {
      throw new ForbiddenException('Seul le créateur peut envoyer des invitations');
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await this.prisma.invitation.create({
      data: {
        tontineId,
        senderId,
        receiverId: dto.userId ?? null,
        email: dto.email ?? null,
        expiresAt,
      },
    });

    if (dto.userId) {
      await this.notificationsService.create({
        userId: dto.userId,
        tontineId,
        type: 'TONTINE_INVITE',
        title: 'Invitation à rejoindre une tontine',
        message: `Vous avez été invité(e) à rejoindre "${tontine.name}"`,
      });
    }

    return invitation;
  }
}
