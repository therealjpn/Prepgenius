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
  getMetrics() {
    return this.adminService.getMetrics();
  }

  // ── Users ──
  @Get('users')
  getUsers(@Query('search') search?: string, @Query('page') page?: string) {
    return this.adminService.getUsers(search, page ? parseInt(page) : 1);
  }

  @Patch('users/:id/toggle-paid')
  togglePaid(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.togglePaid(id);
  }

  @Patch('users/:id/toggle-ban')
  toggleBan(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.toggleBan(id);
  }

  // ── Support Tickets ──
  @Get('tickets')
  getTickets(@Query('status') status?: string) {
    return this.adminService.getTickets(status);
  }

  @Patch('tickets/:id/resolve')
  resolveTicket(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.resolveTicket(id);
  }
}
