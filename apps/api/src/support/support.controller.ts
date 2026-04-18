import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AdminService } from '../admin/admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/support')
@UseGuards(JwtAuthGuard)
export class SupportController {
  constructor(private adminService: AdminService) {}

  @Post('tickets')
  createTicket(@Req() req: any, @Body() body: { subject: string; message: string }) {
    return this.adminService.createTicket(req.user.userId, body.subject, body.message);
  }

  @Get('tickets')
  getMyTickets(@Req() req: any) {
    return this.adminService.getUserTickets(req.user.userId);
  }
}
