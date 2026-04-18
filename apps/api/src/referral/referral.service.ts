import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReferralService {
  private readonly logger = new Logger(ReferralService.name);
  private readonly COIN_VALUE_NGN = 200; // 1 Geniuscoin = 10% of ₦2,000

  constructor(private prisma: PrismaService) {}

  /**
   * Get or create wallet for a user
   */
  async getWallet(userId: number) {
    let wallet = await this.prisma.geniuscoinWallet.findUnique({ where: { userId } });
    if (!wallet) {
      wallet = await this.prisma.geniuscoinWallet.create({ data: { userId } });
    }
    return {
      balance: wallet.balance,
      totalEarned: wallet.totalEarned,
      totalRedeemed: wallet.totalRedeemed,
      ngnEquivalent: wallet.balance * this.COIN_VALUE_NGN,
      lastRedeemDate: wallet.lastRedeemDate,
      nextRedeemableDate: this.getLastDayOfMonth(),
      coinValueNgn: this.COIN_VALUE_NGN,
    };
  }

  /**
   * Get user's referral code and link
   */
  async getReferralInfo(userId: number) {
    let user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true, fullName: true },
    });
    // Auto-generate referral code if missing
    if (!user?.referralCode) {
      const code = 'PG' + Math.random().toString(36).substring(2, 8).toUpperCase();
      await this.prisma.user.update({ where: { id: userId }, data: { referralCode: code } });
      user = { ...user!, referralCode: code };
    }
    const siteUrl = process.env.FRONTEND_URL || 'https://prepgenie-web.onrender.com';
    return {
      referralCode: user.referralCode,
      referralLink: `${siteUrl}/login?ref=${user.referralCode}`,
      userName: user.fullName,
    };
  }

  /**
   * List all referrals for a user
   */
  async getReferrals(userId: number) {
    const referrals = await this.prisma.user.findMany({
      where: { referredById: userId },
      select: {
        id: true,
        fullName: true,
        isPaid: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return referrals.map(r => ({
      name: r.fullName,
      status: r.isPaid ? 'Paid' : 'Pending',
      date: r.createdAt,
    }));
  }

  /**
   * Get referral rewards history
   */
  async getRewards(userId: number) {
    return this.prisma.referralReward.findMany({
      where: { referrerId: userId },
      include: { referredUser: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Award Geniuscoin when a referred user completes payment
   */
  async awardReferralCoin(paidUserId: number) {
    const paidUser = await this.prisma.user.findUnique({
      where: { id: paidUserId },
      select: { referredById: true, fullName: true },
    });

    if (!paidUser?.referredById) {
      this.logger.log(`User ${paidUserId} has no referrer — no coin awarded`);
      return;
    }

    const referrerId = paidUser.referredById;

    // Check if already awarded
    const existing = await this.prisma.referralReward.findUnique({
      where: { referrerId_referredUserId: { referrerId, referredUserId: paidUserId } },
    });
    if (existing) {
      this.logger.log(`Referral reward already exists for referrer ${referrerId} / referred ${paidUserId}`);
      return;
    }

    const redeemableDate = this.getLastDayOfMonth();

    // Create reward record
    await this.prisma.referralReward.create({
      data: {
        referrerId,
        referredUserId: paidUserId,
        coinsAwarded: 1,
        status: 'earned',
        redeemableDate,
      },
    });

    // Update or create wallet
    await this.prisma.geniuscoinWallet.upsert({
      where: { userId: referrerId },
      update: {
        balance: { increment: 1 },
        totalEarned: { increment: 1 },
      },
      create: {
        userId: referrerId,
        balance: 1,
        totalEarned: 1,
      },
    });

    this.logger.log(`🪙 +1 Geniuscoin awarded to user ${referrerId} for referring user ${paidUserId} (${paidUser.fullName})`);
  }

  /**
   * Register a referral code during signup/login
   */
  async applyReferralCode(userId: number, referralCode: string) {
    if (!referralCode) return;

    const referrer = await this.prisma.user.findUnique({ where: { referralCode } });
    if (!referrer || referrer.id === userId) return;

    // Check if user already has a referrer
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user?.referredById) return; // Already referred

    await this.prisma.user.update({
      where: { id: userId },
      data: { referredById: referrer.id },
    });

    this.logger.log(`User ${userId} referred by user ${referrer.id} (code: ${referralCode})`);
  }

  /**
   * Check if user should see the referral nudge
   */
  async shouldShowNudge(userId: number): Promise<boolean> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentReward = await this.prisma.referralReward.findFirst({
      where: {
        referrerId: userId,
        createdAt: { gte: sevenDaysAgo },
      },
    });

    return !recentReward; // Show nudge if no recent reward
  }

  /**
   * Get last day of current month
   */
  private getLastDayOfMonth(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  }

  /**
   * Full dashboard data
   */
  async getDashboard(userId: number) {
    const [wallet, referralInfo, referrals, rewards, showNudge] = await Promise.all([
      this.getWallet(userId),
      this.getReferralInfo(userId),
      this.getReferrals(userId),
      this.getRewards(userId),
      this.shouldShowNudge(userId),
    ]);

    return { wallet, referralInfo, referrals, rewards, showNudge };
  }
}
