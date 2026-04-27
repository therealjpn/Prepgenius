import { Controller, Get, Post, Patch, Query, Param, Body, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from './admin.guard';

@Controller('api/admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  // ── Metrics ──
  @Get('metrics')
  getMetrics(@Query('period') period?: string) {
    return this.adminService.getMetrics(period || 'all');
  }

  // ── Users ──
  @Get('users')
  getUsers(@Query('search') search?: string, @Query('page') page?: string, @Query('filter') filter?: string) {
    return this.adminService.getUsers(search, page ? parseInt(page) : 1, 50, filter);
  }

  @Get('users/export')
  exportUsers(@Query('search') search?: string, @Query('filter') filter?: string) {
    return this.adminService.exportUsers(search, filter);
  }

  @Patch('users/:id/toggle-paid')
  togglePaid(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.adminService.togglePaid(id, req.user.userId);
  }

  @Patch('users/:id/toggle-ban')
  toggleBan(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.adminService.toggleBan(id, req.user.userId);
  }

  @Patch('users/:id/adjust-coins')
  adjustCoins(@Param('id', ParseIntPipe) id: number, @Body() body: { amount: number; reason: string }, @Req() req: any) {
    return this.adminService.adjustCoins(id, body.amount, body.reason, req.user.userId);
  }

  // ── Referrals ──
  @Get('referrals')
  getReferrals(@Query('flagged') flagged?: string) {
    return this.adminService.getReferrals(flagged === 'true');
  }

  @Post('referrals/:id/approve')
  approveReferral(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.adminService.approveReferral(id, req.user.userId);
  }

  @Post('referrals/:id/reject')
  rejectReferral(@Param('id', ParseIntPipe) id: number, @Body() body: { reason: string }, @Req() req: any) {
    return this.adminService.rejectReferral(id, body.reason, req.user.userId);
  }

  // ── Coin Transactions ──
  @Get('coin-transactions')
  getCoinTransactions(@Query('page') page?: string) {
    return this.adminService.getCoinTransactions(page ? parseInt(page) : 1);
  }

  // ── Payouts ──
  @Get('payouts')
  getPayouts(@Query('month') month?: string, @Query('status') status?: string) {
    return this.adminService.getPayouts(month, status);
  }

  @Post('payouts/run-batch')
  runMonthlyBatch(@Body() body: { month?: string }, @Req() req: any) {
    return this.adminService.runMonthlyBatch(req.user.userId, body?.month);
  }

  @Patch('payouts/:id/mark-paid')
  markPayoutPaid(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.adminService.markPayoutPaid(id, req.user.userId);
  }

  @Patch('payouts/:id/reject')
  rejectPayout(@Param('id', ParseIntPipe) id: number, @Body() body: { reason: string }, @Req() req: any) {
    return this.adminService.rejectPayout(id, body.reason, req.user.userId);
  }

  @Post('payouts/bulk-mark-paid')
  bulkMarkPaid(@Body() body: { payoutIds: number[] }, @Req() req: any) {
    return this.adminService.bulkMarkPaid(body.payoutIds, req.user.userId);
  }

  // ── Audit Log ──
  @Get('audit-log')
  getAuditLog(@Query('page') page?: string) {
    return this.adminService.getAuditLog(page ? parseInt(page) : 1);
  }

  // ── Support Tickets ──
  @Get('tickets')
  getTickets(@Query('status') status?: string) {
    return this.adminService.getTickets(status);
  }

  @Patch('tickets/:id/resolve')
  resolveTicket(@Param('id', ParseIntPipe) id: number, @Body() body?: { reply?: string }) {
    return this.adminService.resolveTicket(id, body?.reply);
  }

  @Patch('tickets/:id/reply')
  replyTicket(@Param('id', ParseIntPipe) id: number, @Body() body: { reply: string }) {
    return this.adminService.replyTicket(id, body.reply);
  }

  // ── Weekly Rewards ──
  @Get('weekly-rewards')
  getWeeklyRewards(@Query('week') week?: string) {
    return this.adminService.getWeeklyRewards(week);
  }

  // ── Referral Tracker ──
  @Get('referral-tracker')
  getReferralTracker(@Query('search') search?: string, @Query('page') page?: string, @Query('filter') filter?: string) {
    return this.adminService.getReferralTracker(search, page ? parseInt(page) : 1, 50, filter);
  }

  @Get('referral-tracker/:id')
  getUserReferralDetail(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getUserReferralDetail(id);
  }

  @Post('referral-tracker/:id/upgrade')
  manualReferralUpgrade(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.adminService.manualReferralUpgrade(id, req.user.userId);
  }
}
