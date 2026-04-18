'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

declare global {
  interface Window { squad: any; }
}

export default function PaymentPage() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const router = useRouter();

  // Load Squad SDK
  useEffect(() => {
    if (document.getElementById('squad-sdk')) return;
    const script = document.createElement('script');
    script.id = 'squad-sdk';
    script.src = 'https://checkout.squadco.com/widget/squad.min.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handlePay = async () => {
    if (!user) return router.push('/login');
    setLoading(true);
    try {
      const data = await api.initializePayment();
      if (data.alreadyPaid) { router.push('/subjects'); return; }

      if (!window.squad) {
        alert('Payment gateway is loading. Please try again in a moment.');
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
              router.push('/subjects');
            }
          } catch {
            alert('Payment received but verification pending. Refreshing...');
            window.location.reload();
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
      alert(err.message);
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Verifying your payment...</p>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <div className="payment-card">
        <div className="payment-badge">🔒 Secure Payment</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-bright)', marginBottom: 8 }}>Unlock Full Access</h2>
        <p style={{ color: 'var(--text-dim)', marginBottom: 24 }}>Get unlimited access to all WAEC & NECO past questions.</p>

        <div className="payment-price">
          <span className="payment-currency">₦</span>
          <span className="payment-amount">2,000</span>
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
          {loading ? 'Processing...' : 'Pay ₦2,000 Now'}
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
