import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReferralService } from '../referral/referral.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private prisma: PrismaService,
    private referralService: ReferralService,
  ) {}

  // ── Metrics ──────────────────────────────────────────────────
  async getMetrics() {
    const [totalUsers, paidUsers, bannedUsers, openTickets, totalTickets, revenueResult] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isPaid: true } }),
      this.prisma.user.count({ where: { isBanned: true } }),
      this.prisma.supportTicket.count({ where: { status: 'open' } }),
      this.prisma.supportTicket.count(),
      this.prisma.payment.aggregate({
        where: { status: 'success' },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    const conversionRate = totalUsers > 0 ? ((paidUsers / totalUsers) * 100).toFixed(1) : '0.0';
    // amount is stored in kobo, convert to naira
    const totalRevenueKobo = revenueResult._sum.amount || 0;
    const totalRevenueNgn = totalRevenueKobo / 100;

    // Signups grouped by day for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentUsers = await this.prisma.user.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    return {
      totalUsers,
      paidUsers,
      bannedUsers,
      conversionRate: parseFloat(conversionRate),
      totalRevenueNgn,
      totalPayments: revenueResult._count,
      openTickets,
      totalTickets,
      recentSignups: recentUsers.length,
    };
  }

  // ── User Management ──────────────────────────────────────────
  async getUsers(search?: string, page = 1, limit = 50) {
    const where: any = {};
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true, email: true, fullName: true, avatarUrl: true,
          isPaid: true, isBanned: true, isAdmin: true, createdAt: true,
          referralCode: true,
          wallet: { select: { balance: true } },
          _count: { select: { referrals: true, examSessions: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        avatarUrl: u.avatarUrl,
        isPaid: u.isPaid,
        isBanned: u.isBanned,
        isAdmin: u.isAdmin,
        createdAt: u.createdAt,
        referralCode: u.referralCode,
        geniuscoins: u.wallet?.balance || 0,
        referralCount: u._count.referrals,
        examsTaken: u._count.examSessions,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async togglePaid(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const newStatus = !user.isPaid;
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isPaid: newStatus,
        paidAt: newStatus ? new Date() : null,
      },
    });

    // If upgrading to paid, trigger referral coin award
    if (newStatus) {
      await this.referralService.awardReferralCoin(userId);
      this.logger.log(`⬆️ Admin upgraded user ${userId} to paid — referral coin awarded`);
    } else {
      this.logger.log(`⬇️ Admin downgraded user ${userId} to free`);
    }

    return { userId, isPaid: newStatus };
  }

  async toggleBan(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.isAdmin) throw new NotFoundException('Cannot ban an admin');

    const newStatus = !user.isBanned;
    await this.prisma.user.update({
      where: { id: userId },
      data: { isBanned: newStatus },
    });

    this.logger.log(`${newStatus ? '🚫 Banned' : '✅ Unbanned'} user ${userId} (${user.email})`);
    return { userId, isBanned: newStatus };
  }

  // ── Support Tickets ──────────────────────────────────────────
  async getTickets(status?: string) {
    const where: any = {};
    if (status) where.status = status;

    return this.prisma.supportTicket.findMany({
      where,
      include: { user: { select: { fullName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async resolveTicket(ticketId: number) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Ticket not found');

    await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: 'resolved', resolvedAt: new Date() },
    });

    this.logger.log(`✅ Ticket #${ticketId} resolved`);
    return { ticketId, status: 'resolved' };
  }

  // ── Create Support Ticket (for users) ────────────────────────
  async createTicket(userId: number, subject: string, message: string) {
    return this.prisma.supportTicket.create({
      data: { userId, subject, message },
    });
  }
}
