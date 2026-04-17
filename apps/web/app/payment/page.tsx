'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function PaymentPage() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePay = async () => {
    if (!user) return router.push('/login');
    setLoading(true);
    try {
      const data = await api.initializePayment();
      if (data.alreadyPaid) { router.push('/subjects'); return; }

      // Load Paystack inline
      const handler = (window as any).PaystackPop?.setup({
        key: data.publicKey,
        email: data.email,
        amount: data.amountKobo,
        currency: 'NGN',
        ref: data.reference,
        callback: async (response: any) => {
          try {
            const result = await api.verifyPayment(response.reference);
            if (result.success) {
              setUser({ ...user, isPaid: true });
              router.push('/subjects');
            }
          } catch { alert('Verification failed. Contact support.'); }
        },
        onClose: () => setLoading(false),
      });
      handler?.openIframe();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <script src="https://js.paystack.co/v2/inline.js" async />
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
          <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: 12 }}>
            🔒 Powered by Paystack • Secure & Encrypted
          </p>
        </div>
      </div>
    </>
  );
}
