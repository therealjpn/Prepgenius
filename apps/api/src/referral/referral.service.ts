import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReferralService {
  private readonly logger = new Logger(ReferralService.name);
  private readonly COINS_PER_REFERRAL = 200;  // 200 Genius Coins per referral
  private readonly COIN_VALUE_NGN = 1;         // 1 coin = ₦1 airtime
  private readonly MIN_PAYOUT_COINS = 1000;    // 5 referrals minimum
  private readonly REFERRAL_DISCOUNT = 100;    // ₦100 off for referred user

  constructor(private prisma: PrismaService) {}

  // ── Wallet ─────────────────────────────────────────────────────
  async getWallet(userId: number) {
    let wallet = await this.prisma.geniuscoinWallet.findUnique({ where: { userId } });
    if (!wallet) {
      wallet = await this.prisma.geniuscoinWallet.create({ data: { userId } });
    }
    const lastDayOfMonth = this.getLastDayOfMonth();
    return {
      balance: wallet.balance,
      totalEarned: wallet.totalEarned,
      totalRedeemed: wallet.totalRedeemed,
      ngnEquivalent: wallet.balance * this.COIN_VALUE_NGN,
      lastRedeemDate: wallet.lastRedeemDate,
      nextRedeemableDate: lastDayOfMonth,
      coinValueNgn: this.COIN_VALUE_NGN,
      coinsPerReferral: this.COINS_PER_REFERRAL,
      minPayoutCoins: this.MIN_PAYOUT_COINS,
      referralDiscount: this.REFERRAL_DISCOUNT,
    };
  }

  // ── Referral info ──────────────────────────────────────────────
  async getReferralInfo(userId: number) {
    let user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true, fullName: true },
    });
    if (!user?.referralCode) {
      const code = 'PG' + Math.random().toString(36).substring(2, 8).toUpperCase();
      await this.prisma.user.update({ where: { id: userId }, data: { referralCode: code } });
      user = { ...user!, referralCode: code };
    }
    const siteUrl = process.env.FRONTEND_URL || 'https://prepgenie.xyz';
    return {
      referralCode: user.referralCode,
      referralLink: `${siteUrl}/join?ref=${user.referralCode}`,
      userName: user.fullName,
    };
  }

  // ── Referral list ──────────────────────────────────────────────
  async getReferrals(userId: number) {
    const referrals = await this.prisma.user.findMany({
      where: { referredById: userId },
      select: { id: true, fullName: true, isPaid: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return referrals.map(r => ({
      name: r.fullName,
      status: r.isPaid ? 'Paid' : 'Pending',
      date: r.createdAt,
    }));
  }

  // ── Rewards history ────────────────────────────────────────────
  async getRewards(userId: number) {
    return this.prisma.referralReward.findMany({
      where: { referrerId: userId },
      include: { referredUser: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Award coins on payment (called from PaymentService) ───────
  async awardReferralCoins(paidUserId: number, squadRef?: string) {
    const paidUser = await this.prisma.user.findUnique({
      where: { id: paidUserId },
      select: { referredById: true, fullName: true },
    });

    if (!paidUser?.referredById) {
      this.logger.log(`User ${paidUserId} has no referrer — no coins awarded`);
      return;
    }

    const referrerId = paidUser.referredById;

    // Idempotency: check if already awarded
    const existing = await this.prisma.referralReward.findUnique({
      where: { referrerId_referredUserId: { referrerId, referredUserId: paidUserId } },
    });
    if (existing) {
      this.logger.log(`Referral reward already exists for referrer ${referrerId} / referred ${paidUserId}`);
      return;
    }

    const redeemableDate = this.getLastDayOfMonth();

    // Get current wallet balance for logging
    let wallet = await this.prisma.geniuscoinWallet.findUnique({ where: { userId: referrerId } });
    const balanceBefore = wallet?.balance || 0;
    const balanceAfter = balanceBefore + this.COINS_PER_REFERRAL;

    // Create reward record
    await this.prisma.referralReward.create({
      data: {
        referrerId,
        referredUserId: paidUserId,
        coinsAwarded: this.COINS_PER_REFERRAL,
        status: 'earned',
        redeemableDate,
        squadRef: squadRef || null,
        discountApplied: this.REFERRAL_DISCOUNT,
      },
    });

    // Update wallet
    await this.prisma.geniuscoinWallet.upsert({
      where: { userId: referrerId },
      update: {
        balance: { increment: this.COINS_PER_REFERRAL },
        totalEarned: { increment: this.COINS_PER_REFERRAL },
      },
      create: {
        userId: referrerId,
        balance: this.COINS_PER_REFERRAL,
        totalEarned: this.COINS_PER_REFERRAL,
      },
    });

    // Log coin transaction
    await this.prisma.coinTransaction.create({
      data: {
        userId: referrerId,
        amount: this.COINS_PER_REFERRAL,
        type: 'referral_credit',
        reason: `Referral reward: ${paidUser.fullName} signed up and paid`,
        relatedRef: squadRef || null,
        balanceBefore,
        balanceAfter,
      },
    });

    // Update referral leaderboard
    const currentMonth = this.getCurrentMonth();
    await this.prisma.referralLeaderboard.upsert({
      where: { userId_month: { userId: referrerId, month: currentMonth } },
      update: { successfulReferrals: { increment: 1 } },
      create: { userId: referrerId, month: currentMonth, successfulReferrals: 1 },
    });

    this.logger.log(`🪙 +${this.COINS_PER_REFERRAL} Genius Coins awarded to user ${referrerId} for referring user ${paidUserId} (${paidUser.fullName})`);
  }

  // ── Clawback on reversal/refund ────────────────────────────────
  async clawbackCoins(paidUserId: number, reason: string) {
    const paidUser = await this.prisma.user.findUnique({
      where: { id: paidUserId },
      select: { referredById: true, fullName: true },
    });

    if (!paidUser?.referredById) return;
    const referrerId = paidUser.referredById;

    const reward = await this.prisma.referralReward.findUnique({
      where: { referrerId_referredUserId: { referrerId, referredUserId: paidUserId } },
    });
    if (!reward || reward.status === 'clawed_back') return;

    const wallet = await this.prisma.geniuscoinWallet.findUnique({ where: { userId: referrerId } });
    const balanceBefore = wallet?.balance || 0;
    const coinsToClawback = Math.min(reward.coinsAwarded, balanceBefore);
    const balanceAfter = balanceBefore - coinsToClawback;

    // Update wallet
    if (wallet && coinsToClawback > 0) {
      await this.prisma.geniuscoinWallet.update({
        where: { userId: referrerId },
        data: { balance: { decrement: coinsToClawback } },
      });
    }

    // Mark reward as clawed back
    await this.prisma.referralReward.update({
      where: { id: reward.id },
      data: { status: 'clawed_back' },
    });

    // Log transaction
    await this.prisma.coinTransaction.create({
      data: {
        userId: referrerId,
        amount: -coinsToClawback,
        type: 'clawback',
        reason: `Payment reversal: ${reason}`,
        balanceBefore,
        balanceAfter,
      },
    });

    // Update leaderboard
    const currentMonth = this.getCurrentMonth();
    const lbEntry = await this.prisma.referralLeaderboard.findUnique({
      where: { userId_month: { userId: referrerId, month: currentMonth } },
    });
    if (lbEntry && lbEntry.successfulReferrals > 0) {
      await this.prisma.referralLeaderboard.update({
        where: { id: lbEntry.id },
        data: { successfulReferrals: { decrement: 1 } },
      });
    }

    this.logger.warn(`⚠️ Clawed back ${coinsToClawback} coins from user ${referrerId} — reason: ${reason}`);
  }

  // ── Apply referral code during signup ──────────────────────────
  async applyReferralCode(userId: number, referralCode: string) {
    if (!referralCode) return;

    const referrer = await this.prisma.user.findUnique({ where: { referralCode } });
    if (!referrer || referrer.id === userId) return; // No self-referral

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user?.referredById) return; // Already referred

    await this.prisma.user.update({
      where: { id: userId },
      data: { referredById: referrer.id },
    });

    this.logger.log(`User ${userId} referred by user ${referrer.id} (code: ${referralCode})`);
  }

  // ── Check if user has a referrer (for discount) ────────────────
  async getReferralDiscount(userId: number): Promise<{ hasDiscount: boolean; amount: number }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user?.referredById && !user.isPaid) {
      return { hasDiscount: true, amount: this.REFERRAL_DISCOUNT };
    }
    return { hasDiscount: false, amount: 0 };
  }

  // ── Nudge check ────────────────────────────────────────────────
  async shouldShowNudge(userId: number): Promise<boolean> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentReward = await this.prisma.referralReward.findFirst({
      where: { referrerId: userId, createdAt: { gte: sevenDaysAgo } },
    });
    return !recentReward;
  }

  // ── Phone/network/bank for payout ───────────────────────────────────
  async updatePayoutInfo(userId: number, phone: string, network: string, bankName?: string, bankAccount?: string, accountName?: string) {
    const validNetworks = ['MTN', 'Airtel', 'Glo', '9mobile'];
    if (!validNetworks.includes(network)) {
      throw new BadRequestException(`Invalid network. Must be one of: ${validNetworks.join(', ')}`);
    }
    if (!phone || !/^0[789]\d{9}$/.test(phone)) {
      throw new BadRequestException('Invalid phone number. Must be 11 digits starting with 07, 08, or 09.');
    }
    if (bankAccount && !/^\d{10}$/.test(bankAccount)) {
      throw new BadRequestException('Invalid bank account number. Must be 10 digits.');
    }
    const data: any = { phone, network };
    if (bankName !== undefined) data.bankName = bankName || null;
    if (bankAccount !== undefined) data.bankAccount = bankAccount || null;
    if (accountName !== undefined) data.accountName = accountName || null;
    await this.prisma.user.update({
      where: { id: userId },
      data,
    });
    return { message: 'Payout info updated successfully.' };
  }

  // ── Referral leaderboard ───────────────────────────────────────
  async getReferralLeaderboard(month?: string) {
    const targetMonth = month || this.getCurrentMonth();
    const entries = await this.prisma.referralLeaderboard.findMany({
      where: { month: targetMonth },
      orderBy: { successfulReferrals: 'desc' },
      take: 10,
      include: { user: { select: { fullName: true, avatarUrl: true } } },
    });
    return {
      month: targetMonth,
      leaderboard: entries.map((e, i) => ({
        rank: i + 1,
        userId: e.userId,
        name: e.user.fullName,
        avatarUrl: e.user.avatarUrl,
        referrals: e.successfulReferrals,
        bonusCoins: e.bonusCoins,
      })),
    };
  }

  // ── Full dashboard ─────────────────────────────────────────────
  async getDashboard(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { phone: true, network: true, bankName: true, bankAccount: true, accountName: true },
    });
    const [wallet, referralInfo, referrals, rewards, showNudge, leaderboard] = await Promise.all([
      this.getWallet(userId),
      this.getReferralInfo(userId),
      this.getReferrals(userId),
      this.getRewards(userId),
      this.shouldShowNudge(userId),
      this.getReferralLeaderboard(),
    ]);

    // Find user's rank
    const currentMonth = this.getCurrentMonth();
    const userLb = await this.prisma.referralLeaderboard.findUnique({
      where: { userId_month: { userId, month: currentMonth } },
    });
    let userRank: number | null = null;
    if (userLb) {
      const higher = await this.prisma.referralLeaderboard.count({
        where: { month: currentMonth, successfulReferrals: { gt: userLb.successfulReferrals } },
      });
      userRank = higher + 1;
    }

    // Payout threshold progress
    const coinsNeeded = Math.max(0, this.MIN_PAYOUT_COINS - (wallet.balance || 0));
    const payoutEligible = wallet.balance >= this.MIN_PAYOUT_COINS && !!user?.phone && !!user?.network;

    return {
      wallet,
      referralInfo,
      referrals,
      rewards,
      showNudge,
      leaderboard,
      userRank,
      payoutInfo: {
        phone: user?.phone || null,
        network: user?.network || null,
        bankName: user?.bankName || null,
        bankAccount: user?.bankAccount || null,
        accountName: user?.accountName || null,
        payoutEligible,
        coinsNeeded,
        minPayoutCoins: this.MIN_PAYOUT_COINS,
      },
    };
  }

  // ── Helpers ────────────────────────────────────────────────────
  private getLastDayOfMonth(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  }

  private getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
}
