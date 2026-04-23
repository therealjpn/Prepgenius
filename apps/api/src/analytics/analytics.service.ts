import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Record a page view — called from the frontend beacon.
   * IP is hashed for privacy compliance.
   */
  async recordPageView(data: {
    path: string;
    referrer?: string;
    userAgent?: string;
    ip?: string;
    userId?: number;
  }) {
    const ipHash = data.ip
      ? crypto.createHash('sha256').update(data.ip + '_pg_salt_2026').digest('hex').slice(0, 16)
      : null;

    await this.prisma.pageView.create({
      data: {
        path: data.path,
        referrer: data.referrer || null,
        userAgent: data.userAgent?.slice(0, 512) || null,
        ipHash,
        userId: data.userId || null,
      },
    });
  }

  /**
   * Get analytics data for the admin dashboard.
   */
  async getAnalytics(period = 'all') {
    const since = this.getDateRange(period);
    const dateFilter = since ? { gte: since } : undefined;
    const where = dateFilter ? { createdAt: dateFilter } : {};

    // Core counts
    const [totalPageViews, uniqueVisitorsRaw, topPagesRaw, referrersRaw, dailyViewsRaw] =
      await Promise.all([
        // Total page views
        this.prisma.pageView.count({ where }),

        // Unique visitors (by ipHash)
        this.prisma.pageView.groupBy({
          by: ['ipHash'],
          where: { ...where, ipHash: { not: null } },
        }),

        // Top pages
        this.prisma.pageView.groupBy({
          by: ['path'],
          where,
          _count: { path: true },
          orderBy: { _count: { path: 'desc' } },
          take: 15,
        }),

        // Top referrers
        this.prisma.pageView.groupBy({
          by: ['referrer'],
          where: { ...where, referrer: { not: null } },
          _count: { referrer: true },
          orderBy: { _count: { referrer: 'desc' } },
          take: 10,
        }),

        // Daily page views (last 30 days max)
        this.prisma.$queryRawUnsafe<{ date: string; views: bigint; visitors: bigint }[]>(
          `SELECT 
            DATE(created_at) as date,
            COUNT(*) as views,
            COUNT(DISTINCT ip_hash) as visitors
          FROM page_views
          ${since ? `WHERE created_at >= $1` : ''}
          GROUP BY DATE(created_at)
          ORDER BY date DESC
          LIMIT 30`,
          ...(since ? [since] : []),
        ),
      ]);

    const uniqueVisitors = uniqueVisitorsRaw.length;

    const topPages = topPagesRaw.map((p) => ({
      path: p.path,
      views: p._count.path,
    }));

    const topReferrers = referrersRaw
      .filter((r) => r.referrer)
      .map((r) => ({
        referrer: r.referrer,
        count: r._count.referrer,
      }));

    const dailyViews = dailyViewsRaw.map((d) => ({
      date: String(d.date).split('T')[0],
      views: Number(d.views),
      visitors: Number(d.visitors),
    })).reverse(); // chronological order

    // Today's stats
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const [todayViews, todayVisitorsRaw] = await Promise.all([
      this.prisma.pageView.count({ where: { createdAt: { gte: todayStart } } }),
      this.prisma.pageView.groupBy({
        by: ['ipHash'],
        where: { createdAt: { gte: todayStart }, ipHash: { not: null } },
      }),
    ]);

    return {
      period,
      totalPageViews,
      uniqueVisitors,
      todayViews,
      todayVisitors: todayVisitorsRaw.length,
      topPages,
      topReferrers,
      dailyViews,
    };
  }

  private getDateRange(period: string): Date | null {
    const now = new Date();
    switch (period) {
      case 'today':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case '7d': {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return d;
      }
      case '30d': {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d;
      }
      case 'year':
        return new Date(now.getFullYear(), 0, 1);
      default:
        return null;
    }
  }
}
