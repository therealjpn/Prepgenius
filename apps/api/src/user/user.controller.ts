import { Controller, Get, Delete, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/profile')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  getStats(@Req() req: any) { return this.userService.getStats(req.user.userId); }

  @UseGuards(JwtAuthGuard)
  @Delete('delete')
  deleteProfile(@Req() req: any) { return this.userService.deleteProfile(req.user.userId); }
}
