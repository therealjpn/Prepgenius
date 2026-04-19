import { Controller, Get, Post, Body, UseGuards, Req, Query } from '@nestjs/common';
import { ReferralService } from './referral.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/referral')
export class ReferralController {
  constructor(private referralService: ReferralService) {}

  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  getDashboard(@Req() req: any) {
    return this.referralService.getDashboard(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('wallet')
  getWallet(@Req() req: any) {
    return this.referralService.getWallet(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('list')
  getReferrals(@Req() req: any) {
    return this.referralService.getReferrals(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('apply')
  applyCode(@Req() req: any, @Body() body: { referralCode: string }) {
    return this.referralService.applyReferralCode(req.user.userId, body.referralCode);
  }

  @UseGuards(JwtAuthGuard)
  @Post('payout-info')
  updatePayoutInfo(@Req() req: any, @Body() body: { phone: string; network: string }) {
    return this.referralService.updatePayoutInfo(req.user.userId, body.phone, body.network);
  }

  @UseGuards(JwtAuthGuard)
  @Get('leaderboard')
  getReferralLeaderboard(@Query('month') month?: string) {
    return this.referralService.getReferralLeaderboard(month);
  }
}
