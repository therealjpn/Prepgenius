'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/Toast';

declare global {
  interface Window { squad: any; }
}

export default function PaymentPage() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  // Load Squad SDK
  useEffect(() => {
    if (document.getElementById('squad-sdk')) return;
    const script = document.createElement('script');
    script.id = 'squad-sdk';
    script.src = 'https://checkout.squadco.com/widget/squad.min.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // If already paid, redirect immediately
  useEffect(() => {
    if (user?.isPaid) {
      router.push('/subjects');
    }
  }, [user, router]);

  // Auto-redirect after success animation
  useEffect(() => {
    if (paymentSuccess) {
      const timer = setTimeout(() => {
        router.push('/subjects');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [paymentSuccess, router]);

  const handlePay = async () => {
    if (!user) return router.push('/login');
    setLoading(true);
    try {
      const data = await api.initializePayment();
      if (data.alreadyPaid) {
        setUser({ ...user, isPaid: true });
        setPaymentSuccess(true);
        return;
      }

      if (!window.squad) {
        showToast('Payment gateway is loading. Please try again in a moment.', 'warning');
        setLoading(false);
        return;
      }

      const squadInstance = new window.squad({
        onClose: () => {
          setLoading(false);
        },
        onLoad: () => {
          console.log('Squad widget loaded');
        },
        onSuccess: async () => {
          setVerifying(true);
          try {
            const result = await api.verifyPayment(data.reference);
            if (result.success) {
              setUser({ ...user, isPaid: true });
              setPaymentSuccess(true);
            }
          } catch {
            // Payment went through but verification pending — still show success
            setUser({ ...user, isPaid: true });
            setPaymentSuccess(true);
            showToast('Payment received! Verification will complete shortly.', 'success', 5000);
          } finally {
            setVerifying(false);
            setLoading(false);
          }
        },
        key: data.publicKey,
        email: data.email,
        amount: data.amountKobo,
        currency_code: 'NGN',
        transaction_ref: data.reference,
        customer_name: data.customerName,
        pass_charge: false,
        metadata: {
          userId: user.id,
          plan: 'prepgenie-lifetime',
        },
      });

      squadInstance.setup();
      squadInstance.open();
    } catch (err: any) {
      showToast(err.message, 'error');
      setLoading(false);
    }
  };

  // ── Success Screen ──
  if (paymentSuccess) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          textAlign: 'center', maxWidth: 480, padding: '48px 32px',
          borderRadius: 24, background: 'var(--bg-card)', border: '1px solid var(--border)',
          boxShadow: '0 20px 60px rgba(0,135,81,0.15)',
          animation: 'slideUp 0.4s ease',
        }}>
          <div style={{ fontSize: 72, marginBottom: 20, animation: 'bounce 0.6s ease' }}>🎉</div>
          <h2 style={{
            fontSize: '1.8rem', fontWeight: 900, marginBottom: 8,
            background: 'linear-gradient(135deg, var(--green), var(--green-light), var(--gold))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            Payment Successful!
          </h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '1rem', lineHeight: 1.6, marginBottom: 24 }}>
            Welcome to <strong style={{ color: 'var(--green-light)' }}>PrepGenie Premium</strong>! 🧞‍♂️<br />
            You now have unlimited access to 20,000+ questions.
          </p>
          <div style={{
            display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20,
            flexWrap: 'wrap',
          }}>
            {['📚 All Subjects', '✅ Instant Grading', '🏆 Leaderboard'].map(f => (
              <span key={f} style={{
                padding: '6px 14px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600,
                background: 'rgba(0,135,81,0.1)', color: 'var(--green-light)',
                border: '1px solid rgba(0,135,81,0.2)',
              }}>{f}</span>
            ))}
          </div>
          <button className="btn btn-primary btn-lg" onClick={() => router.push('/subjects')}
            style={{ minWidth: 200 }}>
            🚀 Start Practicing Now
          </button>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: 12 }}>
            Redirecting automatically in 3 seconds...
          </p>
        </div>
      </div>
    );
  }

  // ── Verifying Screen ──
  if (verifying) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Verifying your payment...</p>
      </div>
    );
  }

  // ── Payment Form ──
  return (
    <div className="payment-container">
      <div className="payment-card">
        <div className="payment-badge">🔒 Secure Payment</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-bright)', marginBottom: 8 }}>Unlock Full Access</h2>
        <p style={{ color: 'var(--text-dim)', marginBottom: 24 }}>Get unlimited access to all WAEC & NECO past questions.</p>

        <div className="payment-price">
          <span className="payment-currency">₦</span>
          <span className="payment-amount">1,000</span>
          <span className="payment-period">one-time payment</span>
        </div>

        <ul className="payment-features">
          <li>✅ All 8+ SSCE subjects</li>
          <li>✅ 20,000+ past questions</li>
          <li>✅ Instant grading & explanations</li>
          <li>✅ Weekly leaderboard competition</li>
          <li>✅ Win airtime rewards</li>
          <li>✅ Lifetime access</li>
        </ul>

        <button className="btn btn-primary btn-lg btn-full" onClick={handlePay} disabled={loading}>
          {loading ? 'Processing...' : 'Pay ₦1,000 Now'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>🔒 Powered by</span>
          <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.85rem' }}>Squad by GTBank</span>
        </div>

        <div style={{ textAlign: 'center', marginTop: 8, color: 'var(--text-dim)', fontSize: '0.75rem' }}>
          Pay with Card • Bank Transfer • USSD
        </div>
      </div>
    </div>
  );
}
