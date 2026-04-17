import { Injectable, Logger, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AlocService } from './aloc.service';
import { localQuestions } from './questions.data';

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getCurrentWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split('T')[0];
}

// In-memory store for active exam sessions
const examStore = new Map<number, { questions: any[]; startedAt: number }>();

@Injectable()
export class ExamService {
  private readonly logger = new Logger(ExamService.name);

  constructor(
    private prisma: PrismaService,
    private aloc: AlocService,
  ) {}

  getSubjects() {
    const alocAvailable = this.aloc.isAvailable();
    const subjects = Object.entries(localQuestions).map(([name, data]: [string, any]) => {
      const hasAloc = !!this.aloc.getSubjectSlug(name);
      return {
        name, icon: data.icon, color: data.color, years: data.years,
        questionCount: alocAvailable && hasAloc ? '1000+' : data.questions.length,
        source: alocAvailable && hasAloc ? 'aloc' : 'local',
      };
    });
    return { subjects, alocAvailable };
  }

  getDemoQuestions(subject: string) {
    if (!subject || !localQuestions[subject]) {
      // Default to Mathematics if no subject specified
      subject = Object.keys(localQuestions)[0];
    }
    const bank = localQuestions[subject];
    const selected = shuffleArray([...bank.questions]).slice(0, 5);
    return {
      demo: true,
      subject,
      totalQuestions: 5,
      questions: selected.map((q: any, i: number) => ({
        id: i, question: q.question, options: q.options,
        topic: q.topic, year: q.year, exam_type: q.exam_type,
        correct_answer: q.correct_answer, explanation: q.explanation,
      })),
    };
  }

  submitDemo(body: { subject: string; answers: Record<number, string>; questions: any[] }) {
    const { answers, questions, subject } = body;
    let correctCount = 0;
    const results = questions.map((q: any, i: number) => {
      const userAnswer = answers[i] || '';
      const isCorrect = userAnswer.trim() === q.correct_answer.trim();
      if (isCorrect) correctCount++;
      return {
        questionId: i, question: q.question, options: q.options,
        userAnswer, correctAnswer: q.correct_answer, isCorrect,
        explanation: q.explanation, topic: q.topic, year: q.year,
      };
    });
    const total = questions.length;
    const percentage = Math.round((correctCount / total) * 100);
    return {
      demo: true, results,
      score: { correct: correctCount, total, percentage, pointsEarned: 0, timeTaken: 0 },
      subject, examType: 'DEMO',
    };
  }

  async startExam(userId: number, body: { subject: string; examType?: string; year?: string; questionCount?: number }) {
    const { subject, examType = 'WAEC', year = 'all', questionCount = 10 } = body;
    if (!subject || !localQuestions[subject]) {
      throw new BadRequestException('Invalid subject');
    }

    // Check user is paid
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.isPaid) throw new ForbiddenException('Payment required');

    let selected: any[] = [];
    let source = 'local';

    // Try ALOC first
    if (this.aloc.isAvailable() && this.aloc.getSubjectSlug(subject)) {
      try {
        const alocQ = await this.aloc.fetchQuestions(subject, questionCount, { examType, year });
        if (alocQ.length >= Math.min(questionCount, 5)) {
          selected = shuffleArray(alocQ).slice(0, questionCount);
          source = 'aloc';
          this.logger.log(`Using ${selected.length} ALOC questions for ${subject}`);
        }
      } catch (e: any) {
        this.logger.warn(`ALOC failed for ${subject}: ${e.message}`);
      }
    }

    // Fallback to local
    if (selected.length === 0) {
      const bank = localQuestions[subject];
      let pool = [...bank.questions];
      if (examType !== 'all') { const f = pool.filter((q: any) => q.exam_type === examType); if (f.length > 0) pool = f; }
      if (year !== 'all') { const f = pool.filter((q: any) => q.year === year); if (f.length > 0) pool = f; }
      selected = shuffleArray(pool).slice(0, Math.min(questionCount, pool.length));
      this.logger.log(`Using ${selected.length} local questions for ${subject}`);
    }

    const session = await this.prisma.examSession.create({
      data: { userId, examType, subject, year, totalQuestions: selected.length },
    });

    examStore.set(session.id, { questions: selected, startedAt: Date.now() });

    return {
      sessionId: session.id, subject, examType, source,
      totalQuestions: selected.length,
      questions: selected.map((q: any, i: number) => ({
        id: i, question: q.question, options: q.options,
        topic: q.topic, year: q.year, exam_type: q.exam_type,
      })),
    };
  }

  async submitExam(userId: number, body: { sessionId: number; answers: Record<number, string> }) {
    const { sessionId, answers } = body;
    if (!sessionId || !answers) throw new BadRequestException('Session ID and answers are required');

    const examData = examStore.get(sessionId);
    if (!examData) throw new NotFoundException('Exam session not found or expired');

    const session = await this.prisma.examSession.findUnique({ where: { id: sessionId } });
    if (!session || session.userId !== userId) throw new ForbiddenException('Unauthorized');

    const results: any[] = [];
    let correctCount = 0;

    examData.questions.forEach((q: any, i: number) => {
      const userAnswer = answers[i] || '';
      const isCorrect = userAnswer.trim() === q.correct_answer.trim();
      if (isCorrect) correctCount++;
      results.push({
        questionId: i, question: q.question, options: q.options,
        userAnswer, correctAnswer: q.correct_answer, isCorrect,
        explanation: q.explanation, topic: q.topic, year: q.year,
      });
    });

    const total = examData.questions.length;
    const percentage = Math.round((correctCount / total) * 100);
    const timeTaken = Math.round((Date.now() - examData.startedAt) / 1000);
    const pointsEarned = correctCount * 10;

    await this.prisma.examSession.update({
      where: { id: sessionId },
      data: {
        correctAnswers: correctCount, scorePercentage: percentage,
        pointsEarned, timeTakenSeconds: timeTaken,
        answersJson: JSON.stringify(answers), completed: true, completedAt: new Date(),
      },
    });

    // Upsert leaderboard
    const weekStart = getCurrentWeekStart();
    const existing = await this.prisma.leaderboard.findUnique({
      where: { userId_weekStart: { userId, weekStart } },
    });

    if (existing) {
      const newCorrect = existing.totalCorrect + correctCount;
      const newTotal = existing.totalQuestions + total;
      await this.prisma.leaderboard.update({
        where: { id: existing.id },
        data: {
          totalPoints: existing.totalPoints + pointsEarned,
          totalCorrect: newCorrect, totalQuestions: newTotal,
          examsTaken: existing.examsTaken + 1,
          accuracy: newTotal > 0 ? (newCorrect / newTotal) * 100 : 0,
        },
      });
    } else {
      await this.prisma.leaderboard.create({
        data: {
          userId, weekStart, totalPoints: pointsEarned,
          totalCorrect: correctCount, totalQuestions: total,
          examsTaken: 1, accuracy: total > 0 ? (correctCount / total) * 100 : 0,
        },
      });
    }

    examStore.delete(sessionId);
    return { results, score: { correct: correctCount, total, percentage, pointsEarned, timeTaken }, subject: session.subject, examType: session.examType };
  }
}
