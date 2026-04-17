import { Injectable } from '@nestjs/common';
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
export class LeaderboardService {
  constructor(private prisma: PrismaService) {}

  async getWeekly() {
    const weekStart = getCurrentWeekStart();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const entries = await this.prisma.leaderboard.findMany({
      where: { weekStart },
      orderBy: [{ totalPoints: 'desc' }, { accuracy: 'desc' }],
      take: 20,
      include: { user: { select: { fullName: true, avatarUrl: true, email: true } } },
    });

    const leaderboard = entries.map((e, i) => ({
      rank: i + 1,
      fullName: e.user.fullName,
      avatarUrl: e.user.avatarUrl,
      totalPoints: e.totalPoints,
      totalCorrect: e.totalCorrect,
      totalQuestions: e.totalQuestions,
      examsTaken: e.examsTaken,
      accuracy: Math.round(e.accuracy || 0),
      reward: i === 0 ? '🥇 ₦1,000 Airtime' : i === 1 ? '🥈 ₦500 Airtime' : i === 2 ? '🥉 ₦300 Airtime' : null,
    }));

    return {
      leaderboard, weekStart,
      weekEnd: weekEnd.toISOString().split('T')[0],
      rewards: { first: '₦1,000 Airtime', second: '₦500 Airtime', third: '₦300 Airtime' },
    };
  }
}
