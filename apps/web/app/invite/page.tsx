'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { useToast } from '@/components/Toast';

export default function InvitePage() {
  const { user, loading: authLoading } = useAuth();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [phone, setPhone] = useState('');
  const [network, setNetwork] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [accountName, setAccountName] = useState('');
  const [savingPhone, setSavingPhone] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }

    api.getReferralDashboard()
      .then(data => {
        setDashboard(data);
        setPhone(data.payoutInfo?.phone || '');
        setNetwork(data.payoutInfo?.network || '');
        setBankName(data.payoutInfo?.bankName || '');
        setBankAccount(data.payoutInfo?.bankAccount || '');
        setAccountName(data.payoutInfo?.accountName || '');

        // Show gamified popup based on state
        const balance = data.wallet?.balance || 0;
        const referrals = data.referrals || [];
        const shown = sessionStorage.getItem('pg_referral_modal_shown');

        if (!shown) {
          sessionStorage.setItem('pg_referral_modal_shown', '1');
          if (referrals.length === 0) {
            // First visit, no referrals yet → aggressive first-time modal
            setTimeout(() => setShowStreakModal(true), 800);
          } else if (balance > 0 && balance < 1000) {
            // Has some coins but not enough → milestone nudge
            setTimeout(() => setShowMilestoneModal(true), 800);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  const referralLink = dashboard?.referralInfo?.referralLink || '';
  const wallet = dashboard?.wallet;
  const referrals = dashboard?.referrals || [];
  const payoutInfo = dashboard?.payoutInfo;
  const leaderboard = dashboard?.leaderboard;
  const userRank = dashboard?.userRank;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    showToast('Referral link copied! Share it now 🔥', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = `Omo this PrepGenie app is too good for WAEC/NECO prep — 20,000+ past questions with full explanations. Use my link to save ₦100, and I earn ₦200 cash/airtime. We both win! 🔥`;
  const shareTextShort = `I'm using PrepGenie to ace my WAEC/NECO exams — 20,000+ past questions! Use my link & save ₦100 🔥`;

  const onShared = (platform: string) => {
    showToast(`🔥 Shared on ${platform}! Every share = closer to ₦200. Keep going!`, 'success');
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${referralLink}`)}`, '_blank');
    onShared('WhatsApp');
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(shareTextShort)}`, '_blank');
    onShared('Facebook');
  };

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareTextShort}\n\n${referralLink}`)}`, '_blank');
    onShared('X (Twitter)');
  };

  const shareTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`, '_blank');
    onShared('Telegram');
  };

  const shareTikTok = () => {
    navigator.clipboard.writeText(`${shareTextShort}\n\n${referralLink}`);
    showToast('📋 Link + caption copied! Paste it in your TikTok bio or comment — every view = potential ₦200 💰', 'success');
  };

  const savePayoutInfo = async () => {
    setSavingPhone(true);
    try {
      await api.updatePayoutInfo(phone, network, bankName, bankAccount, accountName);
      showToast('Payout info saved! You\'re all set for payouts 💰', 'success');
      const data = await api.getReferralDashboard();
      setDashboard(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to save', 'error');
    }
    setSavingPhone(false);
  };

  if (authLoading || loading) return <div className="loading-container"><div className="spinner" /><p>Loading...</p></div>;
  if (!user) return null;

  const balance = wallet?.balance || 0;
  const cashValue = balance; // 1 coin = ₦1
  const minPayout = wallet?.minPayoutCoins || 1000;
  const coinsNeeded = Math.max(0, minPayout - balance);
  const referralsNeeded = Math.ceil(coinsNeeded / 200);
  const progress = Math.min(100, (balance / minPayout) * 100);
  const nextPayoutDate = wallet?.nextRedeemableDate ? new Date(wallet.nextRedeemableDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }) : 'End of month';
  const paidReferrals = referrals.filter((r: any) => r.status === 'Paid').length;

  // Milestone calculations for the gamified labels
  const milestones = [
    { refs: 1, coins: 200, label: 'First Blood 🩸' },
    { refs: 3, coins: 600, label: 'Hat Trick 🎩' },
    { refs: 5, coins: 1000, label: 'Cash Out Ready 💰' },
    { refs: 10, coins: 2000, label: 'Referral King 👑' },
    { refs: 25, coins: 5000, label: 'PrepGenie Legend 🏆' },
  ];
  const nextMilestone = milestones.find(m => paidReferrals < m.refs);

  return (
    <div className="page-container">
      <div style={{ maxWidth: 700, margin: '0 auto' }}>

        {/* ═══ HERO HEADER ═══ */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 56, marginBottom: 8, lineHeight: 1 }}>💰</div>
          <h1 style={{ color: 'var(--text-bright)', fontSize: '1.9rem', fontWeight: 900, marginBottom: 10, lineHeight: 1.2 }}>
            Earn <span style={{ color: 'var(--green-light)' }}>Real Cash</span> or <span style={{ color: '#f59e0b' }}>Airtime</span>
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.92rem', lineHeight: 1.7, maxWidth: 580, margin: '0 auto' }}>
            Every friend who pays through your link earns you{' '}
            <strong style={{ color: 'var(--gold)' }}>200 Genius Coins (₦200)</strong> — redeemable as{' '}
            <strong style={{ color: 'var(--green-light)' }}>cash or airtime</strong>, your choice.
            Your friend also saves <strong style={{ color: 'var(--green-light)' }}>₦100</strong> on signup.
            <br/>
            <span style={{ fontSize: '0.82rem', opacity: 0.8 }}>Reach ₦1,000 (5 referrals) to unlock your first payout. Coins never expire.</span>
          </p>
        </div>

        {/* ═══ EARNING BREAKDOWN ═══ */}
        <div style={{
          padding: '20px 24px', marginBottom: 24, borderRadius: 16,
          background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(245,158,11,0.06))',
          border: '1px solid rgba(16,185,129,0.15)',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Per Referral</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--gold)' }}>₦200</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>cash or airtime</div>
            </div>
            <div style={{ borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>5 Referrals</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--green-light)' }}>₦1,000</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>first payout</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>No Limit</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#a78bfa' }}>∞</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>keep earning</div>
            </div>
          </div>
        </div>

        {/* ═══ PHONE/NETWORK MISSING URGENCY BANNER ═══ */}
        {!payoutInfo?.phone && balance > 0 && (
          <div style={{
            padding: '16px 20px', marginBottom: 24, borderRadius: 14,
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
            color: '#ef4444', fontSize: '0.88rem', textAlign: 'center', fontWeight: 600,
            animation: 'pulse 2s infinite',
          }}>
            🚨 You have <strong>₦{cashValue.toLocaleString()}</strong> waiting! Add your phone + network below to receive your cash/airtime payout.
          </div>
        )}

        {/* ═══ REFERRAL LINK + SHARE ═══ */}
        <div style={{
          padding: 24, marginBottom: 24, borderRadius: 16,
          background: 'linear-gradient(135deg, rgba(0,135,81,0.1), rgba(16,185,129,0.15))',
          border: '1px solid rgba(0,135,81,0.3)',
        }}>
          <h3 style={{ color: 'var(--text-bright)', margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 800 }}>🔗 Your Money-Making Link</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.78rem', margin: '0 0 12px' }}>Each click that converts = ₦200 in your pocket</p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input
              readOnly value={referralLink}
              style={{ flex: 1, padding: '10px 14px', borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '0.85rem', outline: 'none' }}
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button className="btn btn-primary btn-sm" onClick={copyLink} style={{ minWidth: 90 }}>
              {copied ? '✅ Copied!' : '📋 Copy'}
            </button>
          </div>

          {/* Share buttons grid */}
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>📣 Share & Earn ₦200 Per Friend</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 12 }}>
            {/* WhatsApp */}
            <button onClick={shareWhatsApp} style={{
              padding: '12px 8px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: '#25D366', color: '#fff', fontWeight: 700, fontSize: '0.78rem',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(37,211,102,0.4)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </button>
            {/* Facebook */}
            <button onClick={shareFacebook} style={{
              padding: '12px 8px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: '#1877F2', color: '#fff', fontWeight: 700, fontSize: '0.78rem',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(24,119,242,0.4)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </button>
            {/* X (Twitter) */}
            <button onClick={shareTwitter} style={{
              padding: '12px 8px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: '#000', color: '#fff', fontWeight: 700, fontSize: '0.78rem',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.4)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              X
            </button>
            {/* TikTok */}
            <button onClick={shareTikTok} style={{
              padding: '12px 8px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #25F4EE, #FE2C55)', color: '#fff', fontWeight: 700, fontSize: '0.78rem',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(254,44,85,0.4)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.43V13a8.16 8.16 0 005.58 2.18v-3.45a4.85 4.85 0 01-3.77-1.72V6.69h3.77z"/></svg>
              TikTok
            </button>
            {/* Telegram */}
            <button onClick={shareTelegram} style={{
              padding: '12px 8px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: '#0088cc', color: '#fff', fontWeight: 700, fontSize: '0.78rem',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,136,204,0.4)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              Telegram
            </button>
          </div>

          {/* Persuasive nudge */}
          <div style={{
            padding: '10px 14px', borderRadius: 10, textAlign: 'center',
            background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)',
            fontSize: '0.78rem', color: 'var(--text-dim)', lineHeight: 1.5,
          }}>
            💡 <strong style={{ color: 'var(--gold)' }}>Pro tip:</strong> Share on your WhatsApp status + class group chat. Students prepping for WAEC will jump on this — and you earn <strong style={{ color: 'var(--green-light)' }}>₦200 per friend</strong> who pays.
          </div>
        </div>

        {/* ═══ WALLET & PROGRESS ═══ */}
        <div style={{
          padding: 24, marginBottom: 24, borderRadius: 16,
          background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(245,158,11,0.08))',
          border: '1px solid var(--border)',
        }}>
          <h3 style={{ color: 'var(--text-bright)', margin: '0 0 16px', fontSize: '1.05rem', fontWeight: 800 }}>💎 Your Earnings</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
            <div style={{ textAlign: 'center', padding: 16, borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--gold)' }}>{balance.toLocaleString()}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Genius Coins</div>
            </div>
            <div style={{ textAlign: 'center', padding: 16, borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--green-light)' }}>₦{cashValue.toLocaleString()}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Cash / Airtime Value</div>
            </div>
            <div style={{ textAlign: 'center', padding: 16, borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)' }}>{paidReferrals}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Converted Referrals</div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: 6 }}>
              <span>🎯 Cash-out at ₦{minPayout.toLocaleString()} ({minPayout / 200} referrals)</span>
              <span style={{ fontWeight: 700, color: progress >= 100 ? 'var(--green-light)' : 'var(--gold)' }}>₦{cashValue.toLocaleString()}/₦{minPayout.toLocaleString()}</span>
            </div>
            <div style={{ height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 5, width: `${progress}%`,
                background: progress >= 100 ? 'linear-gradient(90deg, #10b981, #06b6d4)' : 'linear-gradient(90deg, #f59e0b, #ef4444)',
                transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: progress >= 100 ? '0 0 12px rgba(16,185,129,0.5)' : 'none',
              }} />
            </div>
          </div>

          {/* Status message */}
          <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', textAlign: 'center', marginTop: 10 }}>
            {balance >= minPayout ? (
              <div style={{ color: 'var(--green-light)', fontWeight: 700 }}>
                🎉 You&apos;ve unlocked <strong>₦{cashValue.toLocaleString()}</strong> payout! Redeemable on <strong>{nextPayoutDate}</strong> as <strong>cash or airtime</strong> — your choice.
              </div>
            ) : (
              <div>
                <strong style={{ color: 'var(--gold)' }}>{referralsNeeded} more referral{referralsNeeded !== 1 ? 's' : ''}</strong> to unlock your <strong style={{ color: 'var(--green-light)' }}>₦{minPayout.toLocaleString()}</strong> payout.
                {paidReferrals > 0 && <> You&apos;re <strong>{Math.round(progress)}%</strong> there! 🔥</>}
              </div>
            )}
          </div>

          {/* Milestone badge */}
          {nextMilestone && (
            <div style={{
              marginTop: 12, padding: '10px 14px', borderRadius: 10, textAlign: 'center',
              background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)',
              fontSize: '0.82rem', color: '#a78bfa',
            }}>
              🏅 Next milestone: <strong>{nextMilestone.label}</strong> — {nextMilestone.refs - paidReferrals} referral{nextMilestone.refs - paidReferrals !== 1 ? 's' : ''} away → <strong>₦{nextMilestone.coins.toLocaleString()} earned</strong>
            </div>
          )}
        </div>

        {/* ═══ PAYOUT INFO ═══ */}
        <div style={{
          padding: 24, marginBottom: 24, borderRadius: 16,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
        }}>
          <h3 style={{ color: 'var(--text-bright)', margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 800 }}>💳 How Do You Want Your Money?</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem', margin: '0 0 20px' }}>
            Choose your preferred payout method. We pay out as <strong style={{ color: 'var(--green-light)' }}>airtime</strong> or <strong style={{ color: 'var(--green-light)' }}>bank transfer</strong> at month-end.
          </p>

          {/* ── Airtime Section ── */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--gold)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>📱 Airtime Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 4, fontWeight: 600 }}>Phone Number *</label>
                <input
                  type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="08012345678"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 4, fontWeight: 600 }}>Network *</label>
                <select
                  value={network} onChange={e => setNetwork(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '0.85rem', outline: 'none' }}
                >
                  <option value="">Select network</option>
                  <option value="MTN">MTN</option>
                  <option value="Airtel">Airtel</option>
                  <option value="Glo">Glo</option>
                  <option value="9mobile">9mobile</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Bank Transfer Section ── */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--green-light)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>🏦 Bank Transfer Details <span style={{ fontWeight: 400, textTransform: 'none', opacity: 0.7 }}>(optional)</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 4, fontWeight: 600 }}>Bank Name</label>
                <select
                  value={bankName} onChange={e => setBankName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '0.85rem', outline: 'none' }}
                >
                  <option value="">Select bank</option>
                  <option value="Access Bank">Access Bank</option>
                  <option value="Citibank">Citibank</option>
                  <option value="Ecobank">Ecobank</option>
                  <option value="Fidelity Bank">Fidelity Bank</option>
                  <option value="First Bank">First Bank of Nigeria</option>
                  <option value="FCMB">FCMB</option>
                  <option value="GTBank">GTBank</option>
                  <option value="Heritage Bank">Heritage Bank</option>
                  <option value="Jaiz Bank">Jaiz Bank</option>
                  <option value="Keystone Bank">Keystone Bank</option>
                  <option value="Kuda Bank">Kuda Bank</option>
                  <option value="Moniepoint">Moniepoint</option>
                  <option value="Opay">Opay</option>
                  <option value="Palmpay">Palmpay</option>
                  <option value="Polaris Bank">Polaris Bank</option>
                  <option value="Providus Bank">Providus Bank</option>
                  <option value="Stanbic IBTC">Stanbic IBTC</option>
                  <option value="Standard Chartered">Standard Chartered</option>
                  <option value="Sterling Bank">Sterling Bank</option>
                  <option value="Titan Trust Bank">Titan Trust Bank</option>
                  <option value="UBA">UBA</option>
                  <option value="Union Bank">Union Bank</option>
                  <option value="Unity Bank">Unity Bank</option>
                  <option value="VFD Microfinance">VFD Microfinance</option>
                  <option value="Wema Bank">Wema Bank</option>
                  <option value="Zenith Bank">Zenith Bank</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 4, fontWeight: 600 }}>Account Number</label>
                <input
                  type="text" value={bankAccount} onChange={e => setBankAccount(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="0123456789"
                  maxLength={10}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 4, fontWeight: 600 }}>Account Name</label>
              <input
                type="text" value={accountName} onChange={e => setAccountName(e.target.value)}
                placeholder="John Doe"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '0.85rem', outline: 'none' }}
              />
            </div>
          </div>

          <button className="btn btn-primary btn-sm" onClick={savePayoutInfo} disabled={savingPhone || !phone || !network} style={{ width: '100%' }}>
            {savingPhone ? 'Saving...' : payoutInfo?.phone ? '✅ Update Payout Info' : '💸 Save & Get Paid'}
          </button>

          {/* Saved confirmation */}
          {payoutInfo?.phone && (
            <div style={{ marginTop: 12, padding: '12px 16px', borderRadius: 10, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--green-light)', fontWeight: 600, marginBottom: 4 }}>✅ Payout info saved — you&apos;re all set!</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                📱 Airtime: {payoutInfo.phone} ({payoutInfo.network})
                {payoutInfo.bankAccount && (
                  <><br/>🏦 Bank: {payoutInfo.bankName} — {payoutInfo.bankAccount} ({payoutInfo.accountName})</>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ═══ REFERRER LEADERBOARD ═══ */}
        {leaderboard?.leaderboard?.length > 0 && (
          <div style={{
            padding: 24, marginBottom: 24, borderRadius: 16,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
          }}>
            <h3 style={{ color: 'var(--text-bright)', margin: '0 0 16px', fontSize: '1.05rem', fontWeight: 800 }}>
              🏆 Top Earners — {new Date().toLocaleDateString('en-NG', { month: 'long', year: 'numeric' })}
            </h3>
            {userRank && (
              <div style={{
                padding: '10px 14px', marginBottom: 12, borderRadius: 10,
                background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                fontSize: '0.82rem', color: '#818cf8', textAlign: 'center',
              }}>
                Your rank: <strong>#{userRank}</strong> with <strong>{paidReferrals} referrals (₦{(paidReferrals * 200).toLocaleString()} earned)</strong>
                {userRank <= 3 && ' 🎉 Bonus cash incoming!'}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {leaderboard.leaderboard.map((entry: any) => {
                const medals = ['🥇', '🥈', '🥉'];
                const bonuses = [2000, 1000, 500]; // cash values
                return (
                  <div key={entry.userId} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                    borderRadius: 10, background: entry.rank <= 3 ? 'rgba(245,158,11,0.06)' : 'transparent',
                    border: entry.rank <= 3 ? '1px solid rgba(245,158,11,0.15)' : '1px solid transparent',
                  }}>
                    <span style={{ fontSize: '1.2rem', width: 28, textAlign: 'center' }}>
                      {entry.rank <= 3 ? medals[entry.rank - 1] : `#${entry.rank}`}
                    </span>
                    <span style={{ flex: 1, color: 'var(--text-bright)', fontWeight: 600, fontSize: '0.85rem' }}>
                      {entry.name}
                    </span>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>
                      {entry.referrals} referrals
                    </span>
                    {entry.rank <= 3 && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--green-light)', background: 'rgba(16,185,129,0.1)', padding: '3px 10px', borderRadius: 6, fontWeight: 700 }}>
                        +₦{bonuses[entry.rank - 1].toLocaleString()} bonus
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ YOUR REFERRALS ═══ */}
        <div style={{
          padding: 24, marginBottom: 24, borderRadius: 16,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
        }}>
          <h3 style={{ color: 'var(--text-bright)', margin: '0 0 16px', fontSize: '1.05rem', fontWeight: 800 }}>
            👥 Your Referrals ({referrals.length})
          </h3>
          {referrals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32 }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>😴</div>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: 4 }}>No referrals yet — you&apos;re leaving money on the table!</p>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Share your link now. <strong style={{ color: 'var(--green-light)' }}>₦200 per friend</strong> who pays.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {referrals.map((r: any, i: number) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px',
                  borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--border)',
                }}>
                  <div>
                    <span style={{ color: 'var(--text-bright)', fontWeight: 600, fontSize: '0.88rem' }}>{r.name}</span>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: 2 }}>
                      {new Date(r.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {r.status === 'Paid' ? (
                      <span style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: 6, background: 'rgba(16,185,129,0.1)', color: '#10b981', fontWeight: 700 }}>
                        ✅ +₦200 earned
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: 6, background: 'rgba(245,158,11,0.1)', color: '#f59e0b', fontWeight: 700 }}>
                        ⏳ Awaiting payment
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══ GAMIFIED MODAL: First-time "Start Earning" ═══ */}
      {showStreakModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          animation: 'fadeIn 0.3s ease',
        }} onClick={() => setShowStreakModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            maxWidth: 420, width: '100%', borderRadius: 20, overflow: 'hidden',
            background: 'var(--bg)', border: '1px solid var(--border)',
            animation: 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            {/* Gradient banner */}
            <div style={{
              padding: '32px 24px 24px', textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(0,135,81,0.2), rgba(245,158,11,0.2))',
            }}>
              <div style={{ fontSize: 64, marginBottom: 8, lineHeight: 1 }}>💸</div>
              <h2 style={{ color: 'var(--text-bright)', fontSize: '1.4rem', fontWeight: 900, margin: '0 0 6px', lineHeight: 1.2 }}>
                Your Friends = Your Income
              </h2>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.88rem', margin: 0, lineHeight: 1.5 }}>
                Earn real money every time a friend signs up and pays
              </p>
            </div>
            <div style={{ padding: '20px 24px 28px' }}>
              {/* Reward breakdown */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20,
              }}>
                <div style={{ textAlign: 'center', padding: 16, borderRadius: 14, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--green-light)' }}>₦200</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600 }}>per referral</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: 2 }}>cash or airtime</div>
                </div>
                <div style={{ textAlign: 'center', padding: 16, borderRadius: 14, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--gold)' }}>₦100</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600 }}>friend saves</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: 2 }}>everyone wins</div>
                </div>
              </div>

              {/* Quick math */}
              <div style={{
                padding: '14px 16px', borderRadius: 12, marginBottom: 20,
                background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)',
                fontSize: '0.82rem', color: 'var(--text)', textAlign: 'center', lineHeight: 1.6,
              }}>
                <strong style={{ color: 'var(--gold)' }}>Quick math:</strong><br/>
                5 friends = <strong style={{ color: 'var(--green-light)' }}>₦1,000</strong> 💰 • 10 friends = <strong style={{ color: 'var(--green-light)' }}>₦2,000</strong> 💰💰<br/>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Top referrer bonus: up to ₦2,000 extra monthly</span>
              </div>

              <button className="btn btn-primary" onClick={() => { setShowStreakModal(false); copyLink(); }} style={{
                width: '100%', padding: '14px 20px', fontSize: '1rem', fontWeight: 700,
                borderRadius: 14, justifyContent: 'center',
              }}>
                🚀 Copy My Link & Start Earning
              </button>
              <button onClick={() => setShowStreakModal(false)} style={{
                width: '100%', padding: '10px', marginTop: 8, textAlign: 'center',
                background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer',
                fontSize: '0.82rem',
              }}>
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ GAMIFIED MODAL: Milestone Progress ═══ */}
      {showMilestoneModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          animation: 'fadeIn 0.3s ease',
        }} onClick={() => setShowMilestoneModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            maxWidth: 420, width: '100%', borderRadius: 20, overflow: 'hidden',
            background: 'var(--bg)', border: '1px solid var(--border)',
            animation: 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            <div style={{
              padding: '28px 24px 20px', textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(239,68,68,0.1))',
            }}>
              <div style={{ fontSize: 56, marginBottom: 8, lineHeight: 1 }}>🔥</div>
              <h2 style={{ color: 'var(--text-bright)', fontSize: '1.3rem', fontWeight: 900, margin: '0 0 6px', lineHeight: 1.2 }}>
                You&apos;re {Math.round(progress)}% to ₦{minPayout.toLocaleString()}!
              </h2>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', margin: 0 }}>
                Just <strong style={{ color: 'var(--gold)' }}>{referralsNeeded} more referral{referralsNeeded !== 1 ? 's' : ''}</strong> and we send you cash or airtime
              </p>
            </div>
            <div style={{ padding: '20px 24px 28px' }}>
              {/* Progress visual */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: 6 }}>
                  <span>₦{cashValue.toLocaleString()} earned</span>
                  <span>₦{minPayout.toLocaleString()} goal</span>
                </div>
                <div style={{ height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 6, width: `${progress}%`,
                    background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
                    transition: 'width 1s ease',
                  }} />
                </div>
              </div>

              <div style={{
                padding: '12px 16px', borderRadius: 12, marginBottom: 20,
                background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)',
                fontSize: '0.82rem', color: 'var(--text)', textAlign: 'center',
              }}>
                💡 <strong>Tip:</strong> Share on your WhatsApp status — students preparing for WAEC will thank you (and you earn ₦200 each)
              </div>

              <button className="btn btn-primary" onClick={() => { setShowMilestoneModal(false); shareWhatsApp(); }} style={{
                width: '100%', padding: '14px 20px', fontSize: '1rem', fontWeight: 700,
                borderRadius: 14, justifyContent: 'center',
                background: '#25D366',
              }}>
                💬 Share on WhatsApp Now
              </button>
              <button onClick={() => setShowMilestoneModal(false)} style={{
                width: '100%', padding: '10px', marginTop: 8, textAlign: 'center',
                background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer',
                fontSize: '0.82rem',
              }}>
                I&apos;ll do it later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
