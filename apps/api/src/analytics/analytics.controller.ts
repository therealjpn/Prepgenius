import { Controller, Get, Post, Body, Query, UseGuards, Req, HttpCode } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../admin/admin.guard';

@Controller('api')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  /**
   * Public endpoint — records a page view from the frontend beacon.
   * No auth required, lightweight.
   */
  @Post('analytics/pageview')
  @HttpCode(204)
  async recordPageView(
    @Body() body: { path: string; referrer?: string },
    @Req() req: any,
  ) {
    const userAgent = req.headers['user-agent'];
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.socket?.remoteAddress;

    // Fire and forget — don't block the response
    this.analyticsService
      .recordPageView({
        path: body.path,
        referrer: body.referrer,
        userAgent,
        ip,
        userId: req.user?.userId || null,
      })
      .catch(() => {}); // Silently fail — analytics should never break the app
  }

  /**
   * Admin-only endpoint — returns aggregated analytics data.
   */
  @Get('admin/analytics')
  @UseGuards(JwtAuthGuard, AdminGuard)
  getAnalytics(@Query('period') period?: string) {
    return this.analyticsService.getAnalytics(period || 'all');
  }
}
