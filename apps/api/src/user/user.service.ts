import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function getCurrentWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split('T')[0];
}

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private prisma: PrismaService) {}

  async getStats(userId: number) {
    const sessions = await this.prisma.examSession.findMany({
      where: { userId, completed: true },
      orderBy: { completedAt: 'desc' },
      take: 10,
    });

    const allCompleted = await this.prisma.examSession.findMany({
      where: { userId, completed: true },
    });

    const totalExams = allCompleted.length;
    const avgScore = totalExams > 0 ? Math.round(allCompleted.reduce((a, s) => a + s.scorePercentage, 0) / totalExams) : 0;
    const bestScore = totalExams > 0 ? Math.round(Math.max(...allCompleted.map(s => s.scorePercentage))) : 0;
    const totalCorrect = allCompleted.reduce((a, s) => a + s.correctAnswers, 0);
    const totalAnswered = allCompleted.reduce((a, s) => a + s.totalQuestions, 0);
    const totalPoints = allCompleted.reduce((a, s) => a + s.pointsEarned, 0);

    const weekStart = getCurrentWeekStart();
    const lbEntry = await this.prisma.leaderboard.findUnique({
      where: { userId_weekStart: { userId, weekStart } },
    });

    // Calculate rank
    let rank: number | null = null;
    if (lbEntry) {
      const higherCount = await this.prisma.leaderboard.count({
        where: { weekStart, totalPoints: { gt: lbEntry.totalPoints } },
      });
      rank = higherCount + 1;
    }

    return {
      stats: { totalExams, avgScore, bestScore, totalCorrect, totalAnswered, totalPoints },
      leaderboardRank: rank,
      leaderboardPoints: lbEntry?.totalPoints || 0,
      recentSessions: sessions.map(s => ({
        id: s.id, subject: s.subject, examType: s.examType,
        year: s.year, score: s.scorePercentage, correct: s.correctAnswers,
        total: s.totalQuestions, points: s.pointsEarned, completedAt: s.completedAt,
      })),
    };
  }

  async deleteProfile(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    this.logger.warn(`🗑️ Deleting profile for user ${userId} (${user.email})`);

    // Delete all related data in correct order (foreign key dependencies)
    await this.prisma.$transaction([
      this.prisma.referralReward.deleteMany({ where: { OR: [{ referrerId: userId }, { referredUserId: userId }] } }),
      this.prisma.geniuscoinWallet.deleteMany({ where: { userId } }),
      this.prisma.supportTicket.deleteMany({ where: { userId } }),
      this.prisma.leaderboard.deleteMany({ where: { userId } }),
      this.prisma.examSession.deleteMany({ where: { userId } }),
      this.prisma.payment.deleteMany({ where: { userId } }),
      // Clear referredById on users who were referred by this user
      this.prisma.user.updateMany({ where: { referredById: userId }, data: { referredById: null } }),
      // Delete the user
      this.prisma.user.delete({ where: { id: userId } }),
    ]);

    this.logger.warn(`✅ Profile deleted for ${user.email}`);
    return { message: 'Your account has been permanently deleted.' };
  }
}
