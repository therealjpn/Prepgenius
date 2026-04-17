import { Injectable, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReferralService } from '../referral/referral.service';
import { v4 as uuidv4 } from 'uuid';

const PAYMENT_AMOUNT = 2000;
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_PUBLIC = process.env.PAYSTACK_PUBLIC_KEY || 'pk_test_xxxxxxxx';

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private referralService: ReferralService,
  ) {}

  async initialize(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.isPaid) return { alreadyPaid: true, message: 'You already have full access!' };

    const reference = 'PG-' + uuidv4().split('-')[0].toUpperCase() + '-' + Date.now();
    await this.prisma.payment.create({ data: { userId, reference, amount: PAYMENT_AMOUNT * 100 } });

    return {
      reference, amount: PAYMENT_AMOUNT, amountKobo: PAYMENT_AMOUNT * 100,
      email: user.email, publicKey: PAYSTACK_PUBLIC, currency: 'NGN',
    };
  }

  async verify(userId: number, reference: string) {
    if (!reference) throw new BadRequestException('Payment reference is required');
    const payment = await this.prisma.payment.findUnique({ where: { reference } });
    if (!payment || payment.userId !== userId) throw new NotFoundException('Payment not found');

    let verified = false;
    if (PAYSTACK_SECRET) {
      try {
        const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
          headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
        });
        const data = await res.json();
        verified = data.status && data.data?.status === 'success';
      } catch (e) { /* Paystack error */ }
    } else {
      verified = true; // Demo mode
    }

    if (!verified) throw new BadRequestException('Payment verification failed');

    await this.prisma.payment.update({ where: { reference }, data: { status: 'success', verifiedAt: new Date() } });
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { isPaid: true, paymentRef: reference, paidAt: new Date() },
    });

    // Award Geniuscoin to referrer
    await this.referralService.awardReferralCoin(userId);

    return { success: true, message: 'Payment verified!', user: { id: user.id, email: user.email, fullName: user.fullName, isPaid: true } };
  }

  async status(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    return { isPaid: user?.isPaid || false };
  }
}
