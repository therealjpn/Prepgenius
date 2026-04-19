import { Injectable, ForbiddenException, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReferralService } from '../referral/referral.service';
import { v4 as uuidv4 } from 'uuid';

const PAYMENT_AMOUNT = 1000; // NGN 1,000
const SQUAD_SECRET = process.env.SQUAD_SECRET_KEY || '';
const SQUAD_PUBLIC = process.env.SQUAD_PUBLIC_KEY || '';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private prisma: PrismaService,
    private referralService: ReferralService,
  ) {
    // Log config on startup for debugging
    this.logger.log(`Squad config — Secret key: ${SQUAD_SECRET ? 'configured' : 'NOT SET'}`);
    this.logger.log(`Squad config — Public key: ${SQUAD_PUBLIC ? 'configured' : 'NOT SET'}`);
    this.logger.log(`Squad config — NODE_ENV: ${process.env.NODE_ENV}`);
  }

  private getSquadApiBase(): string {
    // If the secret key starts with 'sandbox_sk_', use sandbox API
    // Otherwise use live API
    if (SQUAD_SECRET.startsWith('sandbox_sk_') || SQUAD_SECRET.startsWith('sandbox')) {
      this.logger.log('Using Squad SANDBOX API');
      return 'https://sandbox-api.squadco.com';
    }
    this.logger.log('Using Squad LIVE API');
    return 'https://api-d.squadco.com';
  }

  async initialize(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.isPaid) return { alreadyPaid: true, message: 'You already have full access!' };

    const reference = 'PG-' + uuidv4().split('-')[0].toUpperCase() + '-' + Date.now();
    await this.prisma.payment.create({
      data: { userId, reference, amount: PAYMENT_AMOUNT * 100, provider: 'squad' },
    });

    this.logger.log(`💳 Payment initialized for user ${userId} — ref: ${reference}`);

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

    // If already verified, return success
    if (payment.status === 'success') {
      this.logger.log(`Payment ${reference} already verified — returning success`);
      return { success: true, message: 'Payment already verified.' };
    }

    let verified = false;
    const apiBase = this.getSquadApiBase();

    if (SQUAD_SECRET) {
      try {
        const url = `${apiBase}/transaction/verify/${reference}`;
        this.logger.log(`Verifying payment at: ${url}`);
        
        const res = await fetch(url, {
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

        if (!verified) {
          this.logger.warn(`Squad verification returned non-success: status=${data.data?.transaction_status}, success=${data.success}`);
        }
      } catch (e: any) {
        this.logger.error(`Squad verification error: ${e.message}`);
      }
    } else {
      // Demo mode — auto-verify when no secret key configured
      verified = true;
      this.logger.warn('Squad secret key not configured — auto-verifying (demo mode)');
    }

    if (!verified) throw new BadRequestException('Payment verification failed. Please try again or contact support.');

    return this.markPaymentSuccess(userId, reference);
  }

  // ── Webhook handler for Squad ──────────────────────────────────
  async handleWebhook(body: any, signature: string) {
    this.logger.log(`📩 Webhook received: ${JSON.stringify(body)}`);

    // Verify webhook signature using HMAC SHA512
    if (SQUAD_SECRET) {
      const crypto = await import('crypto');
      const hash = crypto.createHmac('sha512', SQUAD_SECRET)
        .update(JSON.stringify(body))
        .digest('hex')
        .toUpperCase();
      
      if (hash !== signature?.toUpperCase()) {
        this.logger.warn('❌ Webhook signature mismatch — ignoring');
        return { status: 'ignored', reason: 'signature_mismatch' };
      }
    }

    const { transaction_ref, transaction_status } = body?.Body?.data || body?.data || body || {};

    if (!transaction_ref) {
      this.logger.warn('Webhook missing transaction_ref');
      return { status: 'ignored', reason: 'no_reference' };
    }

    if (transaction_status !== 'success') {
      this.logger.log(`Webhook for ${transaction_ref} — status: ${transaction_status} (not success)`);
      return { status: 'ignored', reason: 'not_success' };
    }

    // Find payment
    const payment = await this.prisma.payment.findUnique({ where: { reference: transaction_ref } });
    if (!payment) {
      this.logger.warn(`Webhook: payment not found for ref ${transaction_ref}`);
      return { status: 'ignored', reason: 'payment_not_found' };
    }

    if (payment.status === 'success') {
      this.logger.log(`Webhook: payment ${transaction_ref} already verified`);
      return { status: 'already_verified' };
    }

    await this.markPaymentSuccess(payment.userId, transaction_ref);
    this.logger.log(`✅ Webhook verified payment for user ${payment.userId}`);
    return { status: 'success' };
  }

  // ── Shared helper to mark payment success ─────────────────────
  private async markPaymentSuccess(userId: number, reference: string) {
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

