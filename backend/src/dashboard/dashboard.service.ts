import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ContributionStatus,
  MedicalRequestStatus,
  MembershipStatus,
  TontineStatus,
} from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getGlobalStats() {
    const [
      totalUsers,
      totalTontines,
      activeTontines,
      totalMemberships,
      paidContributions,
      totalCollected,
      pendingRequests,
      approvedRequests,
    ] = await Promise.all([
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.tontine.count(),
      this.prisma.tontine.count({ where: { status: TontineStatus.ACTIVE } }),
      this.prisma.membership.count({ where: { status: MembershipStatus.ACTIVE } }),
      this.prisma.contribution.count({ where: { status: ContributionStatus.PAID } }),
      this.prisma.contribution.aggregate({
        where: { status: ContributionStatus.PAID },
        _sum: { amount: true },
      }),
      this.prisma.medicalRequest.count({ where: { status: MedicalRequestStatus.PENDING } }),
      this.prisma.medicalRequest.count({ where: { status: MedicalRequestStatus.APPROVED } }),
    ]);

    return {
      users: { total: totalUsers },
      tontines: { total: totalTontines, active: activeTontines },
      memberships: { total: totalMemberships },
      contributions: {
        total: paidContributions,
        totalCollected: Number(totalCollected._sum.amount ?? 0),
      },
      medicalRequests: { pending: pendingRequests, approved: approvedRequests },
    };
  }

  async getUserDashboard(userId: string) {
    const [
      activeMembershipsCount,
      totalContributions,
      paidContributions,
      pendingContributions,
      lateContributions,
      medicalRequestsCount,
      unreadNotifications,
      totalPaid,
    ] = await Promise.all([
      this.prisma.membership.count({ where: { userId, status: MembershipStatus.ACTIVE } }),
      this.prisma.contribution.count({ where: { userId } }),
      this.prisma.contribution.count({ where: { userId, status: ContributionStatus.PAID } }),
      this.prisma.contribution.count({ where: { userId, status: ContributionStatus.UNPAID } }),
      this.prisma.contribution.count({ where: { userId, status: ContributionStatus.LATE } }),
      this.prisma.medicalRequest.count({ where: { userId } }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
      this.prisma.contribution.aggregate({
        where: { userId, status: ContributionStatus.PAID },
        _sum: { amount: true },
      }),
    ]);

    // Fetch active tontine IDs separately (no nested subquery)
    const activeMemberships = await this.prisma.membership.findMany({
      where: { userId, status: MembershipStatus.ACTIVE },
      select: { tontineId: true },
    });
    const tontineIds = activeMemberships.map((m) => m.tontineId);

    const [recentContributions, recentRequests] = await Promise.all([
      this.prisma.contribution.findMany({
        where: { userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { tontine: { select: { name: true, slug: true } } },
      }),
      tontineIds.length > 0
        ? this.prisma.medicalRequest.findMany({
            where: { tontineId: { in: tontineIds } },
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
              user: { select: { firstName: true, lastName: true } },
              tontine: { select: { name: true } },
            },
          })
        : Promise.resolve([]),
    ]);

    return {
      stats: {
        activeTontines: activeMembershipsCount,
        totalContributions,
        paidContributions,
        pendingContributions,
        lateContributions,
        totalPaid: Number(totalPaid._sum.amount ?? 0),
        medicalRequests: medicalRequestsCount,
        unreadNotifications,
      },
      recentActivity: {
        contributions: recentContributions,
        medicalRequests: recentRequests,
      },
    };
  }

  async getTontineDashboard(tontineId: string) {
    const tontine = await this.prisma.tontine.findUnique({
      where: { id: tontineId },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true } },
        _count: {
          select: {
            memberships: { where: { status: MembershipStatus.ACTIVE } },
          },
        },
      },
    });

    if (!tontine) return null;

    const [totalCollected, pendingContribs, lateContribs, pendingRequests, monthlyData] =
      await Promise.all([
        this.prisma.contribution.aggregate({
          where: { tontineId, status: ContributionStatus.PAID },
          _sum: { amount: true },
        }),
        this.prisma.contribution.count({
          where: { tontineId, status: ContributionStatus.UNPAID },
        }),
        this.prisma.contribution.count({
          where: { tontineId, status: ContributionStatus.LATE },
        }),
        this.prisma.medicalRequest.count({
          where: { tontineId, status: MedicalRequestStatus.PENDING },
        }),
        this.prisma.contribution.groupBy({
          by: ['periodLabel'],
          where: { tontineId, status: ContributionStatus.PAID },
          _sum: { amount: true },
          _count: true,
          orderBy: { periodLabel: 'asc' },
          take: 12,
        }),
      ]);

    return {
      tontine,
      stats: {
        activeMembers: tontine._count.memberships,
        totalCollected: Number(totalCollected._sum.amount ?? 0),
        pendingContributions: pendingContribs,
        lateContributions: lateContribs,
        pendingMedicalRequests: pendingRequests,
      },
      chart: {
        monthlyContributions: monthlyData.map((m) => ({
          period: m.periodLabel,
          amount: Number(m._sum.amount ?? 0),
          count: m._count,
        })),
      },
    };
  }
}
