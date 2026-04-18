import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ExamModule } from './exam/exam.module';
import { PaymentModule } from './payment/payment.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { UserModule } from './user/user.module';
import { ReferralModule } from './referral/referral.module';
import { AdminModule } from './admin/admin.module';
import { SupportModule } from './support/support.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ExamModule,
    PaymentModule,
    LeaderboardModule,
    UserModule,
    ReferralModule,
    AdminModule,
    SupportModule,
  ],
})
export class AppModule {}
