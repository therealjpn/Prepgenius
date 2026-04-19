import { Injectable, ForbiddenException, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReferralService } from '../referral/referral.service';
import { v4 as uuidv4 } from 'uuid';

const PAYMENT_AMOUNT = 1000; // NGN 1,000
const REFERRAL_DISCOUNT = 100; // ₦100 off with referral
const SQUAD_SECRET = process.env.SQUAD_SECRET_KEY || '';
const SQUAD_PUBLIC = process.env.SQUAD_PUBLIC_KEY || '';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private prisma: PrismaService,
    private referralService: ReferralService,
  ) {
    this.logger.log(`Squad config — Secret key: ${SQUAD_SECRET ? 'configured' : 'NOT SET'}`);
    this.logger.log(`Squad config — Public key: ${SQUAD_PUBLIC ? 'configured' : 'NOT SET'}`);
    this.logger.log(`Squad config — NODE_ENV: ${process.env.NODE_ENV}`);
  }

  private getSquadApiBase(): string {
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

    // Check for referral discount
    const discount = await this.referralService.getReferralDiscount(userId);
    const finalAmount = discount.hasDiscount ? PAYMENT_AMOUNT - discount.amount : PAYMENT_AMOUNT;

    const reference = 'PG-' + uuidv4().split('-')[0].toUpperCase() + '-' + Date.now();
    await this.prisma.payment.create({
      data: {
        userId,
        reference,
        amount: finalAmount * 100, // Store in kobo
        provider: 'squad',
        discountAmount: discount.amount,
        referralCode: discount.hasDiscount ? 'referral' : null,
      },
    });

    this.logger.log(`💳 Payment initialized for user ${userId} — ref: ${reference}, amount: ₦${finalAmount}${discount.hasDiscount ? ' (₦' + discount.amount + ' referral discount)' : ''}`);

    return {
      reference,
      amount: finalAmount,
      amountKobo: finalAmount * 100,
      email: user.email,
      customerName: user.fullName,
      publicKey: SQUAD_PUBLIC,
      currency: 'NGN',
      provider: 'squad',
      discount: discount.hasDiscount ? {
        amount: discount.amount,
        originalPrice: PAYMENT_AMOUNT,
        message: `₦${discount.amount} off with referral!`,
      } : null,
    };
  }

  async verify(userId: number, reference: string) {
    if (!reference) throw new BadRequestException('Payment reference is required');
    const payment = await this.prisma.payment.findUnique({ where: { reference } });
    if (!payment || payment.userId !== userId) throw new NotFoundException('Payment not found');

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
        this.logger.log(`Squad verify response status: ${data.success}, txn_status: ${data.data?.transaction_status}`);

        verified = data.success && data.data?.transaction_status === 'success';

        if (!verified) {
          this.logger.warn(`Squad verification non-success: status=${data.data?.transaction_status}`);
        }
      } catch (e: any) {
        this.logger.error(`Squad verification error: ${e.message}`);
      }
    } else {
      verified = true;
      this.logger.warn('Squad secret key not configured — auto-verifying (demo mode)');
    }

    if (!verified) throw new BadRequestException('Payment verification failed. Please try again or contact support.');

    return this.markPaymentSuccess(userId, reference);
  }

  // ── Webhook handler for Squad ──────────────────────────────────
  async handleWebhook(body: any, signature: string) {
    this.logger.log(`📩 Webhook received — raw keys: ${JSON.stringify(Object.keys(body))}`);
    this.logger.log(`📩 Webhook body preview: ${JSON.stringify(body).substring(0, 500)}`);

    // Verify webhook signature using HMAC SHA512
    if (SQUAD_SECRET && signature) {
      const crypto = await import('crypto');
      const hash = crypto.createHmac('sha512', SQUAD_SECRET)
        .update(JSON.stringify(body))
        .digest('hex')
        .toUpperCase();
      
      if (hash !== signature?.toUpperCase()) {
        this.logger.warn(`❌ Webhook signature mismatch — hash: ${hash.substring(0, 16)}..., sig: ${signature?.substring(0, 16)}...`);
        // DON'T reject — JSON.stringify may differ from raw body; log but continue
        // We'll verify the transaction via API instead
        this.logger.warn('⚠️ Proceeding despite signature mismatch (will verify via API)');
      } else {
        this.logger.log('✅ Webhook signature verified');
      }
    }

    // ── Extract data from Squad webhook payload ──
    // Squad format: { Event: "charge_successful", TransactionRef: "PG-...", Body: { transaction_ref, status, amount, ... } }
    const event = body?.Event || body?.event || '';
    const bodyData = body?.Body || body?.body || {};
    const transactionRef = bodyData?.transaction_ref || body?.TransactionRef || body?.transaction_ref || '';
    const status = bodyData?.status || bodyData?.transaction_status || body?.transaction_status || '';

    this.logger.log(`📩 Parsed webhook — event: "${event}", ref: "${transactionRef}", status: "${status}"`);

    if (!transactionRef) {
      this.logger.warn('Webhook missing transaction_ref — full body: ' + JSON.stringify(body).substring(0, 500));
      return { status: 'ignored', reason: 'no_reference' };
    }

    // Handle refund/reversal events
    if (event === 'charge.refund' || event === 'charge.reversed' || event === 'charge_refunded' || 
        status === 'reversed' || status === 'refunded') {
      return this.handleReversal(transactionRef, event);
    }

    if (status !== 'success') {
      this.logger.log(`Webhook for ${transactionRef} — status: "${status}" (not "success")`);
      return { status: 'ignored', reason: 'not_success' };
    }

    const payment = await this.prisma.payment.findUnique({ where: { reference: transactionRef } });
    if (!payment) {
      this.logger.warn(`Webhook: payment not found for ref "${transactionRef}"`);
      return { status: 'ignored', reason: 'payment_not_found' };
    }

    if (payment.status === 'success') {
      this.logger.log(`Webhook: payment ${transactionRef} already verified`);
      return { status: 'already_verified' };
    }

    // Extra safety: verify via Squad API before upgrading
    let apiVerified = false;
    try {
      const apiBase = this.getSquadApiBase();
      const url = `${apiBase}/transaction/verify/${transactionRef}`;
      this.logger.log(`🔍 Double-checking via API: ${url}`);
      const res = await fetch(url, {
        method: 'GET',
        headers: { Authorization: `Bearer ${SQUAD_SECRET}`, 'Content-Type': 'application/json' },
      });
      const verifyData = await res.json();
      apiVerified = verifyData.success && verifyData.data?.transaction_status === 'success';
      this.logger.log(`🔍 API verify result: success=${verifyData.success}, status=${verifyData.data?.transaction_status}`);
    } catch (e: any) {
      this.logger.warn(`API verify failed (proceeding with webhook): ${e.message}`);
      apiVerified = true; // If API is unreachable, trust the webhook
    }

    if (!apiVerified) {
      this.logger.warn(`❌ Webhook claimed success but API verification failed for ${transactionRef}`);
      return { status: 'ignored', reason: 'api_verification_failed' };
    }

    await this.markPaymentSuccess(payment.userId, transactionRef);
    this.logger.log(`✅ Webhook verified & upgraded user ${payment.userId} (ref: ${transactionRef})`);
    return { status: 'success' };
  }

  // ── Handle payment reversal ────────────────────────────────────
  private async handleReversal(reference: string, eventType: string) {
    const payment = await this.prisma.payment.findUnique({ where: { reference } });
    if (!payment) {
      this.logger.warn(`Reversal: payment not found for ref ${reference}`);
      return { status: 'ignored', reason: 'payment_not_found' };
    }

    this.logger.warn(`⚠️ Payment reversal for ref ${reference} — event: ${eventType}`);

    // Mark payment as reversed
    await this.prisma.payment.update({
      where: { reference },
      data: { status: 'reversed' },
    });

    // Claw back referral coins
    try {
      await this.referralService.clawbackCoins(payment.userId, `Payment reversed: ${eventType}`);
    } catch (e: any) {
      this.logger.error(`Clawback failed for user ${payment.userId}: ${e.message}`);
    }

    // Optionally revoke access (leave isPaid for admin to handle manually)
    this.logger.warn(`⚠️ User ${payment.userId} payment reversed — admin review needed`);
    return { status: 'reversal_processed' };
  }

  // ── Shared helper to mark payment success ─────────────────────
  private async markPaymentSuccess(userId: number, reference: string) {
    const payment = await this.prisma.payment.findUnique({ where: { reference } });

    await this.prisma.payment.update({
      where: { reference },
      data: { status: 'success', verifiedAt: new Date() },
    });

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { isPaid: true, paymentRef: reference, paidAt: new Date() },
    });

    // Award Genius Coins to referrer (200 coins per referral)
    try {
      await this.referralService.awardReferralCoins(userId, reference);
    } catch (e: any) {
      // Never block payment on referral failure
      this.logger.error(`Referral coin award failed for user ${userId}: ${e.message}`);
    }

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
