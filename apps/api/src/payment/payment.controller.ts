import { Controller, Post, Get, Body, UseGuards, Req, Headers } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @Post('initialize')
  initialize(@Req() req: any) { return this.paymentService.initialize(req.user.userId); }

  @UseGuards(JwtAuthGuard)
  @Post('verify')
  verify(@Req() req: any, @Body() body: { reference: string }) { return this.paymentService.verify(req.user.userId, body.reference); }

  @UseGuards(JwtAuthGuard)
  @Get('status')
  status(@Req() req: any) { return this.paymentService.status(req.user.userId); }

  // Squad webhook — no auth guard (Squad calls this directly)
  @Post('webhook')
  webhook(@Body() body: any, @Headers('x-squad-encrypted-body') signature: string) {
    return this.paymentService.handleWebhook(body, signature);
  }
}
