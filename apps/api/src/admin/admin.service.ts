import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReferralService } from '../referral/referral.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private prisma: PrismaService,
    private referralService: ReferralService,
  ) {}

  // ── Audit logging helper ──────────────────────────────────────
  private async audit(adminId: number, action: string, targetType: string, targetId: number | null, details?: any) {
    await this.prisma.auditLog.create({
      data: { adminId, action, targetType, targetId, details: details ? JSON.stringify(details) : null },
    });
  }

  // ── Metrics ──────────────────────────────────────────────────
  private getDateRange(period: string): Date | null {
    const now = new Date();
    switch (period) {
      case 'today': return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case '7d': { const d = new Date(); d.setDate(d.getDate() - 7); return d; }
      case '30d': { const d = new Date(); d.setDate(d.getDate() - 30); return d; }
      case 'year': return new Date(now.getFullYear(), 0, 1);
      default: return null;
    }
  }

  async getMetrics(period = 'all') {
    const since = this.getDateRange(period);
    const dateFilter = since ? { gte: since } : undefined;
    const userWhere = dateFilter ? { createdAt: dateFilter } : {};
    const paymentWhere: any = { status: 'success' };
    if (dateFilter) paymentWhere.verifiedAt = dateFilter;

    const [
      totalUsersAll, totalUsersFiltered, paidUsersAll, paidUsersFiltered,
      bannedUsers, openTickets, totalTickets,
      revenueAll, revenueFiltered,
      totalReferrals, pendingPayouts,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: userWhere }),
      this.prisma.user.count({ where: { isPaid: true } }),
      this.prisma.user.count({ where: { isPaid: true, ...userWhere } }),
      this.prisma.user.count({ where: { isBanned: true } }),
      this.prisma.supportTicket.count({ where: { status: 'open' } }),
      this.prisma.supportTicket.count(),
      this.prisma.payment.aggregate({
        where: { status: 'success' },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.payment.aggregate({
        where: paymentWhere,
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.referralReward.count({ where: { status: 'earned' } }),
      this.prisma.payout.count({ where: { status: 'pending' } }),
    ]);

    const conversionRate = totalUsersAll > 0 ? ((paidUsersAll / totalUsersAll) * 100).toFixed(1) : '0.0';

    return {
      period,
      totalUsersAll, paidUsersAll,
      totalRevenueNgnAll: (revenueAll._sum.amount || 0) / 100,
      newSignups: totalUsersFiltered,
      newPaidUsers: paidUsersFiltered,
      revenueNgn: (revenueFiltered._sum.amount || 0) / 100,
      paymentsCount: revenueFiltered._count,
      conversionRate: parseFloat(conversionRate),
      bannedUsers, openTickets, totalTickets,
      totalReferrals, pendingPayouts,
    };
  }

  // ── User Management ──────────────────────────────────────────
  async getUsers(search?: string, page = 1, limit = 50, filter?: string) {
    const where: any = {};
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (filter === 'paid') where.isPaid = true;
    else if (filter === 'free') where.isPaid = false;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true, email: true, fullName: true, avatarUrl: true,
          isPaid: true, isBanned: true, isAdmin: true, createdAt: true,
          referralCode: true, phone: true, network: true,
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
        id: u.id, email: u.email, fullName: u.fullName, avatarUrl: u.avatarUrl,
        isPaid: u.isPaid, isBanned: u.isBanned, isAdmin: u.isAdmin, createdAt: u.createdAt,
        referralCode: u.referralCode, phone: u.phone, network: u.network,
        geniuscoins: u.wallet?.balance || 0,
        referralCount: u._count.referrals,
        examsTaken: u._count.examSessions,
      })),
      total, page, totalPages: Math.ceil(total / limit),
    };
  }

  // ── Export Users ────────────────────────────────────────────────
  async exportUsers(search?: string, filter?: string) {
    const where: any = {};
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (filter === 'paid') where.isPaid = true;
    else if (filter === 'free') where.isPaid = false;

    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true, email: true, fullName: true,
        isPaid: true, isBanned: true, isAdmin: true, createdAt: true,
        referralCode: true, phone: true, network: true,
        wallet: { select: { balance: true } },
        _count: { select: { referrals: true, examSessions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map(u => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      status: u.isPaid ? 'Paid' : 'Free',
      banned: u.isBanned ? 'Yes' : 'No',
      admin: u.isAdmin ? 'Yes' : 'No',
      geniuscoins: u.wallet?.balance || 0,
      referrals: u._count.referrals,
      examsTaken: u._count.examSessions,
      referralCode: u.referralCode || '',
      phone: u.phone || '',
      network: u.network || '',
      joinedAt: u.createdAt.toISOString(),
    }));
  }

  async togglePaid(userId: number, adminId?: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const newStatus = !user.isPaid;
    await this.prisma.user.update({
      where: { id: userId },
      data: { isPaid: newStatus, paidAt: newStatus ? new Date() : null },
    });

    if (newStatus) {
      await this.referralService.awardReferralCoins(userId);
      this.logger.log(`⬆️ Admin upgraded user ${userId} to paid — referral coins awarded`);
    } else {
      this.logger.log(`⬇️ Admin downgraded user ${userId} to free`);
    }

    if (adminId) await this.audit(adminId, 'toggle_paid', 'user', userId, { newStatus });
    return { userId, isPaid: newStatus };
  }

  async toggleBan(userId: number, adminId?: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.isAdmin) throw new NotFoundException('Cannot ban an admin');

    const newStatus = !user.isBanned;
    await this.prisma.user.update({
      where: { id: userId },
      data: { isBanned: newStatus },
    });

    this.logger.log(`${newStatus ? '🚫 Banned' : '✅ Unbanned'} user ${userId} (${user.email})`);
    if (adminId) await this.audit(adminId, newStatus ? 'ban_user' : 'unban_user', 'user', userId);
    return { userId, isBanned: newStatus };
  }

  // ── Adjust Coin Balance ────────────────────────────────────────
  async adjustCoins(userId: number, amount: number, reason: string, adminId: number) {
    const wallet = await this.prisma.geniuscoinWallet.findUnique({ where: { userId } });
    const balanceBefore = wallet?.balance || 0;
    const balanceAfter = balanceBefore + amount;

    if (balanceAfter < 0) throw new BadRequestException('Resulting balance cannot be negative');

    await this.prisma.geniuscoinWallet.upsert({
      where: { userId },
      update: {
        balance: { increment: amount },
        ...(amount > 0 ? { totalEarned: { increment: amount } } : {}),
      },
      create: { userId, balance: Math.max(0, amount), totalEarned: Math.max(0, amount) },
    });

    await this.prisma.coinTransaction.create({
      data: { userId, amount, type: 'admin_adjust', reason, adminActorId: adminId, balanceBefore, balanceAfter },
    });

    await this.audit(adminId, 'adjust_coins', 'user', userId, { amount, reason, balanceBefore, balanceAfter });
    this.logger.log(`🪙 Admin ${adminId} adjusted user ${userId} coins by ${amount}: ${reason}`);
    return { userId, balanceBefore, balanceAfter, amount };
  }

  // ── Referrals ──────────────────────────────────────────────────
  async getReferrals(flaggedOnly = false) {
    const where: any = flaggedOnly ? { flagged: true } : {};
    return this.prisma.referralReward.findMany({
      where,
      include: {
        referrer: { select: { id: true, fullName: true, email: true } },
        referredUser: { select: { id: true, fullName: true, email: true, isPaid: true, createdAt: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  async approveReferral(rewardId: number, adminId: number) {
    await this.prisma.referralReward.update({ where: { id: rewardId }, data: { flagged: false, flagReason: null } });
    await this.audit(adminId, 'approve_referral', 'referral_reward', rewardId);
    return { rewardId, status: 'approved' };
  }

  async rejectReferral(rewardId: number, reason: string, adminId: number) {
    const reward = await this.prisma.referralReward.findUnique({ where: { id: rewardId } });
    if (!reward) throw new NotFoundException('Reward not found');

    // Claw back coins
    await this.referralService.clawbackCoins(reward.referredUserId, `Admin rejected: ${reason}`);
    await this.prisma.referralReward.update({ where: { id: rewardId }, data: { status: 'rejected', flagReason: reason } });
    await this.audit(adminId, 'reject_referral', 'referral_reward', rewardId, { reason });
    return { rewardId, status: 'rejected' };
  }

  // ── Coin Transactions ──────────────────────────────────────────
  async getCoinTransactions(page = 1, limit = 100) {
    const [transactions, total] = await Promise.all([
      this.prisma.coinTransaction.findMany({
        include: { user: { select: { fullName: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.coinTransaction.count(),
    ]);
    return { transactions, total, page, totalPages: Math.ceil(total / limit) };
  }

  // ── Monthly Payouts ────────────────────────────────────────────
  async getPayouts(month?: string, status?: string) {
    const where: any = {};
    if (month) where.batchMonth = month;
    if (status) where.status = status;

    return this.prisma.payout.findMany({
      where,
      include: { user: { select: { fullName: true, email: true, phone: true, network: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async runMonthlyBatch(adminId: number, month?: string) {
    const batchMonth = month || this.getCurrentMonth();

    // Idempotency: check if batch already ran
    const existing = await this.prisma.payout.count({ where: { batchMonth } });
    if (existing > 0) {
      throw new BadRequestException(`Batch already ran for ${batchMonth}. Found ${existing} existing payout records.`);
    }

    // Find eligible users (≥1000 coins)
    const wallets = await this.prisma.geniuscoinWallet.findMany({
      where: { balance: { gte: 1000 } },
      include: { user: { select: { id: true, fullName: true, phone: true, network: true } } },
    });

    let pendingCount = 0;
    let awaitingInfoCount = 0;
    let totalAirtime = 0;

    for (const w of wallets) {
      const hasInfo = !!w.user.phone && !!w.user.network;
      const payoutCoins = w.balance;
      const payoutNgn = payoutCoins; // 1 coin = ₦1

      await this.prisma.payout.create({
        data: {
          userId: w.user.id,
          batchMonth,
          coins: payoutCoins,
          amountNgn: payoutNgn,
          phone: w.user.phone,
          network: w.user.network,
          status: hasInfo ? 'pending' : 'awaiting_info',
        },
      });

      if (hasInfo) {
        // Deduct coins from wallet
        await this.prisma.geniuscoinWallet.update({
          where: { userId: w.user.id },
          data: { balance: { decrement: payoutCoins }, totalRedeemed: { increment: payoutCoins } },
        });

        await this.prisma.coinTransaction.create({
          data: {
            userId: w.user.id,
            amount: -payoutCoins,
            type: 'payout_debit',
            reason: `Monthly airtime payout for ${batchMonth}`,
            adminActorId: adminId,
            balanceBefore: w.balance,
            balanceAfter: w.balance - payoutCoins,
          },
        });

        totalAirtime += payoutNgn;
        pendingCount++;
      } else {
        awaitingInfoCount++;
      }
    }

    // Award top 3 referrer bonuses
    const topReferrers = await this.prisma.referralLeaderboard.findMany({
      where: { month: batchMonth },
      orderBy: { successfulReferrals: 'desc' },
      take: 3,
    });

    const bonuses = [2000, 1000, 500];
    for (let i = 0; i < topReferrers.length && i < 3; i++) {
      if (topReferrers[i].successfulReferrals > 0) {
        const wallet = await this.prisma.geniuscoinWallet.findUnique({ where: { userId: topReferrers[i].userId } });
        const balBefore = wallet?.balance || 0;

        await this.prisma.geniuscoinWallet.upsert({
          where: { userId: topReferrers[i].userId },
          update: { balance: { increment: bonuses[i] }, totalEarned: { increment: bonuses[i] } },
          create: { userId: topReferrers[i].userId, balance: bonuses[i], totalEarned: bonuses[i] },
        });

        await this.prisma.coinTransaction.create({
          data: {
            userId: topReferrers[i].userId,
            amount: bonuses[i],
            type: 'bonus',
            reason: `Top ${i + 1} referrer bonus for ${batchMonth}`,
            adminActorId: adminId,
            balanceBefore: balBefore,
            balanceAfter: balBefore + bonuses[i],
          },
        });

        await this.prisma.referralLeaderboard.update({
          where: { id: topReferrers[i].id },
          data: { bonusCoins: bonuses[i] },
        });
      }
    }

    await this.audit(adminId, 'run_monthly_batch', 'payout', null, { batchMonth, pendingCount, awaitingInfoCount, totalAirtime });
    this.logger.log(`📦 Monthly batch for ${batchMonth}: ${pendingCount} payouts (₦${totalAirtime}), ${awaitingInfoCount} awaiting info`);

    return { batchMonth, pendingCount, awaitingInfoCount, totalAirtime, topReferrerBonuses: topReferrers.length };
  }

  async markPayoutPaid(payoutId: number, adminId: number) {
    const payout = await this.prisma.payout.findUnique({ where: { id: payoutId } });
    if (!payout) throw new NotFoundException('Payout not found');

    await this.prisma.payout.update({
      where: { id: payoutId },
      data: { status: 'paid', processedAt: new Date(), adminActorId: adminId },
    });

    await this.audit(adminId, 'mark_payout_paid', 'payout', payoutId, { amount: payout.amountNgn });
    return { payoutId, status: 'paid' };
  }

  async rejectPayout(payoutId: number, reason: string, adminId: number) {
    const payout = await this.prisma.payout.findUnique({ where: { id: payoutId } });
    if (!payout) throw new NotFoundException('Payout not found');

    // Refund coins if they were deducted
    if (payout.status === 'pending') {
      await this.prisma.geniuscoinWallet.update({
        where: { userId: payout.userId },
        data: { balance: { increment: payout.coins }, totalRedeemed: { decrement: payout.coins } },
      });

      const wallet = await this.prisma.geniuscoinWallet.findUnique({ where: { userId: payout.userId } });
      await this.prisma.coinTransaction.create({
        data: {
          userId: payout.userId,
          amount: payout.coins,
          type: 'admin_adjust',
          reason: `Payout rejected: ${reason}`,
          adminActorId: adminId,
          balanceBefore: (wallet?.balance || payout.coins) - payout.coins,
          balanceAfter: wallet?.balance || payout.coins,
        },
      });
    }

    await this.prisma.payout.update({
      where: { id: payoutId },
      data: { status: 'rejected', adminNote: reason, adminActorId: adminId, processedAt: new Date() },
    });

    await this.audit(adminId, 'reject_payout', 'payout', payoutId, { reason, amount: payout.amountNgn });
    return { payoutId, status: 'rejected' };
  }

  async bulkMarkPaid(payoutIds: number[], adminId: number) {
    const results = [];
    for (const id of payoutIds) {
      try {
        const result = await this.markPayoutPaid(id, adminId);
        results.push(result);
      } catch (e: any) {
        results.push({ payoutId: id, error: e.message });
      }
    }
    return { results, processed: results.length };
  }

  // ── Audit Log ──────────────────────────────────────────────────
  async getAuditLog(page = 1, limit = 100) {
    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        include: { admin: { select: { fullName: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.auditLog.count(),
    ]);
    return { logs, total, page, totalPages: Math.ceil(total / limit) };
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

  async resolveTicket(ticketId: number, reply?: string) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Ticket not found');

    await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: 'resolved', resolvedAt: new Date(), ...(reply ? { adminReply: reply } : {}) },
    });

    this.logger.log(`✅ Ticket #${ticketId} resolved`);
    return { ticketId, status: 'resolved' };
  }

  async replyTicket(ticketId: number, reply: string) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return this.prisma.supportTicket.update({ where: { id: ticketId }, data: { adminReply: reply } });
  }

  // ── User-Facing Ticket Methods ───────────────────────────────
  async createTicket(userId: number, subject: string, message: string) {
    return this.prisma.supportTicket.create({ data: { userId, subject, message } });
  }

  async getUserTickets(userId: number) {
    return this.prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, subject: true, message: true, adminReply: true, status: true, createdAt: true, resolvedAt: true },
    });
  }

  // ── Weekly Rewards (Admin) ─────────────────────────────────────
  private getWeekStart(offset = 0): string {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? 6 : day - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - diff + offset * 7);
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString().split('T')[0];
  }

  async getWeeklyRewards(weekStart?: string) {
    const targetWeek = weekStart || this.getWeekStart(0);

    const entries = await this.prisma.leaderboard.findMany({
      where: { weekStart: targetWeek },
      orderBy: [{ totalPoints: 'desc' }, { accuracy: 'desc' }],
      take: 20,
      include: {
        user: {
          select: {
            id: true, fullName: true, email: true, phone: true, network: true,
            avatarUrl: true, isPaid: true,
          },
        },
      },
    });

    const weekEnd = new Date(targetWeek);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const rewards = ['₦1,000 Airtime', '₦500 Airtime', '₦300 Airtime'];

    return {
      weekStart: targetWeek,
      weekEnd: weekEnd.toISOString().split('T')[0],
      entries: entries.map((e, i) => ({
        rank: i + 1,
        userId: e.user.id,
        fullName: e.user.fullName,
        email: e.user.email,
        phone: e.user.phone || '—',
        network: e.user.network || '—',
        avatarUrl: e.user.avatarUrl,
        isPaid: e.user.isPaid,
        totalPoints: e.totalPoints,
        accuracy: Math.round(e.accuracy || 0),
        examsTaken: e.examsTaken,
        reward: i < 3 ? rewards[i] : null,
      })),
      previousWeek: this.getWeekStart(-1),
    };
  }

  // ── Referral Tracker ─────────────────────────────────────────────
  async getReferralTracker(search?: string, page = 1, limit = 50, filter?: string) {
    // Find all users who have at least one referral OR have a referral code
    const where: any = {
      OR: [
        { referrals: { some: {} } },
        { referralCode: { not: null } },
      ],
    };

    if (search) {
      where.AND = {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { referralCode: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const allReferrers = await this.prisma.user.findMany({
      where,
      select: {
        id: true, email: true, fullName: true, avatarUrl: true,
        isPaid: true, referralCode: true, createdAt: true, paidAt: true,
        wallet: { select: { balance: true, totalEarned: true } },
        referrals: {
          select: { id: true, isPaid: true },
        },
        _count: { select: { referrals: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const siteUrl = process.env.FRONTEND_URL || 'https://prepgenie.xyz';
    const THRESHOLD = 5;

    // Check for referral_upgrade transactions in bulk
    const userIds = allReferrers.map(u => u.id);
    const upgradeTxns = await this.prisma.coinTransaction.findMany({
      where: { userId: { in: userIds }, type: 'referral_upgrade' },
      select: { userId: true, createdAt: true },
    });
    const upgradeMap = new Map<number, Date>();
    for (const txn of upgradeTxns) {
      if (!upgradeMap.has(txn.userId)) upgradeMap.set(txn.userId, txn.createdAt);
    }

    let enriched = allReferrers.map(u => {
      const totalReferred = u._count.referrals;
      const verifiedReferred = u.referrals.filter(r => r.isPaid).length;
      const pendingReferred = totalReferred - verifiedReferred;
      const upgradedViaReferrals = upgradeMap.has(u.id);
      const upgradeDate = upgradeMap.get(u.id) || null;

      return {
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        avatarUrl: u.avatarUrl,
        isPaid: u.isPaid,
        referralCode: u.referralCode,
        referralLink: u.referralCode ? `${siteUrl}/join?ref=${u.referralCode}` : null,
        totalReferred,
        verifiedReferred,
        pendingReferred,
        threshold: THRESHOLD,
        progress: Math.min(100, Math.round((verifiedReferred / THRESHOLD) * 100)),
        geniuscoins: u.wallet?.balance || 0,
        totalCoinsEarned: u.wallet?.totalEarned || 0,
        upgradedViaReferrals,
        upgradeDate,
        createdAt: u.createdAt,
      };
    });

    // Apply filters
    if (filter === 'upgraded') {
      enriched = enriched.filter(u => u.upgradedViaReferrals);
    } else if (filter === 'close') {
      enriched = enriched.filter(u => !u.isPaid && u.verifiedReferred >= 3 && u.verifiedReferred < THRESHOLD);
    } else if (filter === 'active') {
      enriched = enriched.filter(u => u.totalReferred >= 1);
    } else if (filter === 'free') {
      enriched = enriched.filter(u => !u.isPaid);
    }

    const total = enriched.length;
    const paginated = enriched.slice((page - 1) * limit, page * limit);

    // Summary stats
    const totalActiveReferrers = allReferrers.filter(u => u._count.referrals >= 1).length;
    const totalUpgraded = upgradeMap.size;
    const totalCloseToThreshold = allReferrers.filter(u => {
      const v = u.referrals.filter(r => r.isPaid).length;
      return !u.isPaid && v >= 3 && v < THRESHOLD;
    }).length;
    const totalVerifiedReferrals = allReferrers.reduce((sum, u) => sum + u.referrals.filter(r => r.isPaid).length, 0);

    return {
      referrers: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      summary: {
        totalActiveReferrers,
        totalUpgraded,
        totalCloseToThreshold,
        totalVerifiedReferrals,
      },
    };
  }

  async getUserReferralDetail(userId: number) {
    return this.referralService.getReferralProgress(userId);
  }

  async manualReferralUpgrade(userId: number, adminId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.isPaid) throw new BadRequestException('User is already a paid/premium user');

    // Upgrade user to premium
    await this.prisma.user.update({
      where: { id: userId },
      data: { isPaid: true, paidAt: new Date() },
    });

    // Count their verified referrals for the log
    const verifiedCount = await this.prisma.user.count({
      where: { referredById: userId, isPaid: true },
    });

    // Log the manual upgrade as a coin transaction
    const wallet = await this.prisma.geniuscoinWallet.findUnique({ where: { userId } });
    await this.prisma.coinTransaction.create({
      data: {
        userId,
        amount: 0,
        type: 'referral_upgrade',
        reason: `🎉 Premium access granted by admin (manual referral upgrade, ${verifiedCount} verified referrals)`,
        adminActorId: adminId,
        balanceBefore: wallet?.balance || 0,
        balanceAfter: wallet?.balance || 0,
      },
    });

    await this.audit(adminId, 'manual_referral_upgrade', 'user', userId, { verifiedCount });
    this.logger.log(`🎉 Admin ${adminId} manually upgraded user ${userId} (${user.fullName}) to premium via referral program`);
    return { userId, isPaid: true, verifiedReferrals: verifiedCount };
  }

  private getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
}
