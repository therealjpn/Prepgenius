import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { ReferralModule } from '../referral/referral.module';

@Module({
  imports: [ReferralModule],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
