import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, TontineStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getOverview() {
    const [users, tontines, pendingMedical, totalPayments] = await Promise.all([
      this.prisma.user.groupBy({ by: ['role'], _count: true }),
      this.prisma.tontine.groupBy({ by: ['status'], _count: true }),
      this.prisma.medicalRequest.count({ where: { status: 'PENDING' } }),
      this.prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    return { users, tontines, pendingMedical, totalPayments };
  }

  async getUsers(query: { page?: number; limit?: number; search?: string; role?: Role }) {
    const { page = 1, limit = 10, search, role } = query;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) where.role = role;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, email: true, username: true, firstName: true,
          lastName: true, role: true, isActive: true, createdAt: true,
          _count: { select: { memberships: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data: users, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async updateUserRole(userId: string, role: Role) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, email: true, role: true },
    });
  }

  async toggleUserActive(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
    });
  }

  async getTontines(query: { page?: number; limit?: number; status?: TontineStatus }) {
    const { page = 1, limit = 10, status } = query;
    const skip = (page - 1) * limit;
    const where: any = status ? { status } : {};

    const [tontines, total] = await Promise.all([
      this.prisma.tontine.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: { select: { id: true, firstName: true, lastName: true, email: true } },
          _count: { select: { memberships: true, contributions: true } },
        },
      }),
      this.prisma.tontine.count({ where }),
    ]);

    return { data: tontines, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getPendingMedicalRequests() {
    return this.prisma.medicalRequest.findMany({
      where: { status: { in: ['PENDING', 'UNDER_REVIEW'] } },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        tontine: { select: { id: true, name: true } },
        _count: { select: { votes: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
