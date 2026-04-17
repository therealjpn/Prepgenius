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
export class UserService {
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
}
