import { Injectable, ForbiddenException, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReferralService } from '../referral/referral.service';
import { v4 as uuidv4 } from 'uuid';

const PAYMENT_AMOUNT = 2000; // NGN 2,000
const SQUAD_SECRET = process.env.SQUAD_SECRET_KEY || '';
const SQUAD_PUBLIC = process.env.SQUAD_PUBLIC_KEY || '';
const IS_LIVE = process.env.NODE_ENV === 'production' && SQUAD_SECRET && !SQUAD_SECRET.startsWith('sandbox');
const SQUAD_API_BASE = IS_LIVE ? 'https://api.squadco.com' : 'https://sandbox-api.squadco.com';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private prisma: PrismaService,
    private referralService: ReferralService,
  ) {}

  async initialize(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.isPaid) return { alreadyPaid: true, message: 'You already have full access!' };

    const reference = 'PG-' + uuidv4().split('-')[0].toUpperCase() + '-' + Date.now();
    await this.prisma.payment.create({
      data: { userId, reference, amount: PAYMENT_AMOUNT * 100, provider: 'squad' },
    });

    return {
      reference,
      amount: PAYMENT_AMOUNT,
      amountKobo: PAYMENT_AMOUNT * 100,
      email: user.email,
      customerName: user.fullName,
      publicKey: SQUAD_PUBLIC,
      currency: 'NGN',
      provider: 'squad',
    };
  }

  async verify(userId: number, reference: string) {
    if (!reference) throw new BadRequestException('Payment reference is required');
    const payment = await this.prisma.payment.findUnique({ where: { reference } });
    if (!payment || payment.userId !== userId) throw new NotFoundException('Payment not found');

    let verified = false;

    if (SQUAD_SECRET) {
      try {
        const res = await fetch(`${SQUAD_API_BASE}/transaction/verify/${reference}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${SQUAD_SECRET}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await res.json();
        this.logger.log(`Squad verify response: ${JSON.stringify(data)}`);

        // Squad returns { success: true, data: { transaction_status: 'success' } }
        verified = data.success && data.data?.transaction_status === 'success';
      } catch (e: any) {
        this.logger.error(`Squad verification error: ${e.message}`);
      }
    } else {
      // Demo mode — auto-verify when no secret key configured
      verified = true;
      this.logger.warn('Squad secret key not configured — auto-verifying (demo mode)');
    }

    if (!verified) throw new BadRequestException('Payment verification failed. Please try again or contact support.');

    await this.prisma.payment.update({
      where: { reference },
      data: { status: 'success', verifiedAt: new Date() },
    });

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { isPaid: true, paymentRef: reference, paidAt: new Date() },
    });

    // Award Geniuscoin to referrer
    await this.referralService.awardReferralCoin(userId);

    this.logger.log(`✅ Payment verified for user ${userId} (ref: ${reference})`);
    return {
      success: true,
      message: 'Payment verified! You now have full access.',
      user: { id: user.id, email: user.email, fullName: user.fullName, isPaid: true },
    };
  }

  async status(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    return { isPaid: user?.isPaid || false };
  }
}
