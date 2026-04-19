'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';

const REFERRAL_MESSAGES = [
  { emoji: '💸', title: 'Turn Your Friends Into Cash!', subtitle: 'Every friend who pays = ₦200 cash or airtime in your pocket. Your link is literally a money printer.' },
  { emoji: '🔥', title: 'You\'re Leaving Money On The Table!', subtitle: 'Your classmates are prepping for WAEC right now. Send them your link — ₦200 per person, cash or airtime.' },
  { emoji: '🚀', title: 'Your Mates Are Cashing Out...', subtitle: 'Top referrers earn ₦2,000+ monthly. Share your link now — 5 friends = ₦1,000 cash or airtime.' },
  { emoji: '🎯', title: 'Quick Math: 5 Friends = ₦1,000', subtitle: 'Share on your WhatsApp status right now. Each conversion = ₦200 cash or airtime. No limits.' },
  { emoji: '⚡', title: 'Fastest Way to Free Airtime!', subtitle: '2 minutes to share, ₦200 per friend who pays. Cash or airtime — your choice when you redeem.' },
  { emoji: '🏆', title: 'Challenge: Hit ₦1,000 This Week!', subtitle: 'Just 5 referrals and you unlock your first ₦1,000 payout — cash or airtime. Start sharing!' },
  { emoji: '💎', title: 'Your Link = Your Side Hustle', subtitle: 'No selling, no stress. Just share PrepGenie → friends pay → you earn ₦200 each. Cash or airtime.' },
  { emoji: '😱', title: 'Wait... You Haven\'t Shared Yet?!', subtitle: 'Students in your class are looking for WAEC past questions RIGHT NOW. Be the plug, earn ₦200 each.' },
  { emoji: '🤑', title: 'PrepGenie Pays You To Help Friends!', subtitle: 'Every payment through your link = ₦200. Redeem as airtime or cash transfer. Zero catch.' },
];

const SHARE_PLATFORMS = [
  { name: 'WhatsApp', icon: '💬', color: '#25D366', getUrl: (link: string, text: string) => `https://wa.me/?text=${encodeURIComponent(text + '\n\n' + link)}` },
  { name: 'X', icon: '𝕏', color: '#000', getUrl: (link: string, text: string) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text + '\n\n' + link)}` },
  { name: 'Telegram', icon: '✈️', color: '#0088cc', getUrl: (link: string, text: string) => `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}` },
  { name: 'Facebook', icon: '📘', color: '#1877F2', getUrl: (link: string, text: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}&quote=${encodeURIComponent(text)}` },
];

export function ReferralPopup() {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [referralLink, setReferralLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);
  const [confetti, setConfetti] = useState(false);
  const [coins, setCoins] = useState(0);
  const [referralCount, setReferralCount] = useState(0);

  const shouldShowPopup = useCallback(() => {
    if (!user) return false;
    // Don't show on the invite page itself (it has its own modals)
    if (typeof window !== 'undefined' && window.location.pathname === '/invite') return false;
    // Don't show on login or landing page
    if (typeof window !== 'undefined' && (window.location.pathname === '/' || window.location.pathname === '/login')) return false;

    const lastDismissed = localStorage.getItem('pg_referral_popup_dismissed');
    if (lastDismissed) {
      const hours = (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60);
      if (hours < 4) return false; // Show every 4 hours
    }
    return true;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    // Random message each time
    setMsgIndex(Math.floor(Math.random() * REFERRAL_MESSAGES.length));

    // Fetch referral data
    const fetchReferral = async () => {
      try {
        const data = await api.getReferralDashboard();
        setReferralLink(data.referralInfo?.referralLink || '');
        setCoins(data.wallet?.balance || 0);
        setReferralCount(data.referrals?.length || 0);
      } catch {}
    };
    fetchReferral();

    // Show after delay (random 8-15 seconds to feel organic)
    const delay = 8000 + Math.random() * 7000;
    const timer = setTimeout(() => {
      if (shouldShowPopup()) setShow(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [user, shouldShowPopup]);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('pg_referral_popup_dismissed', Date.now().toString());
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setConfetti(true);
      setTimeout(() => setCopied(false), 3000);
      setTimeout(() => setConfetti(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = referralLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setConfetti(true);
      setTimeout(() => setCopied(false), 3000);
      setTimeout(() => setConfetti(false), 2000);
    }
  };

  const handleShare = (platform: typeof SHARE_PLATFORMS[0]) => {
    const shareText = `PrepGenie is the cheat code for WAEC/NECO prep — 20,000+ past questions with full explanations. Use my link to save ₦100, and I earn ₦200 cash/airtime. We both win! 🔥`;
    window.open(platform.getUrl(referralLink, shareText), '_blank', 'width=600,height=400');
    // Don't auto-close — let them share on multiple platforms
  };

  const msg = REFERRAL_MESSAGES[msgIndex];

  if (!show || !user || !referralLink) return null;

  const cashValue = coins; // 1 coin = ₦1
  const paidReferrals = referralCount;
  const minPayout = 1000;
  const progress = Math.min(100, (cashValue / minPayout) * 100);
  const coinsNeeded = Math.max(0, minPayout - cashValue);
  const referralsNeeded = Math.ceil(coinsNeeded / 200);

  return (
    <>
      {/* Overlay */}
      <div onClick={handleDismiss} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
        zIndex: 9998, animation: 'fadeIn 0.3s ease',
      }} />

      {/* Popup */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '92%', maxWidth: 420, zIndex: 9999,
        background: 'linear-gradient(145deg, #0f1a14, #0a1f12)',
        border: '2px solid rgba(16,185,129,0.3)', borderRadius: 24,
        padding: '0', boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(16,185,129,0.1)',
        animation: 'popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        overflow: 'hidden',
      }}>
        {/* Confetti particles */}
        {confetti && (
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 24, pointerEvents: 'none' }}>
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} style={{
                position: 'absolute',
                width: 8, height: 8, borderRadius: '50%',
                background: ['#10b981', '#f59e0b', '#818cf8', '#ef4444', '#06b6d4', '#a78bfa'][i % 6],
                left: `${Math.random() * 100}%`, top: '-10px',
                animation: `confettiFall ${0.8 + Math.random() * 0.6}s ease-out forwards`,
                animationDelay: `${Math.random() * 0.3}s`,
              }} />
            ))}
          </div>
        )}

        {/* Gradient header */}
        <div style={{
          padding: '24px 24px 16px', textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(245,158,11,0.1))',
        }}>
          {/* Close */}
          <button onClick={handleDismiss} style={{
            position: 'absolute', top: 12, right: 14, border: 'none', background: 'none',
            color: 'var(--text-dim)', fontSize: '1.2rem', cursor: 'pointer', padding: 4,
          }}>✕</button>

          {/* Animated emoji */}
          <div style={{
            fontSize: 52, marginBottom: 6, lineHeight: 1,
            animation: 'bounce 1s ease infinite',
          }}>{msg.emoji}</div>

          {/* Title */}
          <h3 style={{
            fontSize: '1.25rem', fontWeight: 900,
            color: 'var(--text-bright)', margin: '0 0 6px', lineHeight: 1.2,
            background: 'linear-gradient(135deg, #10b981, #f59e0b)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>{msg.title}</h3>

          <p style={{ color: 'var(--text-dim)', fontSize: '0.84rem', margin: 0, lineHeight: 1.5 }}>
            {msg.subtitle}
          </p>
        </div>

        <div style={{ padding: '16px 24px 24px' }}>
          {/* Stats row */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, justifyContent: 'center' }}>
            <div style={{
              flex: 1, padding: '8px 10px', borderRadius: 10, background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.2)', textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>{paidReferrals}</div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: 600 }}>Referrals</div>
            </div>
            <div style={{
              flex: 1, padding: '8px 10px', borderRadius: 10, background: 'rgba(245,158,11,0.1)',
              border: '1px solid rgba(245,158,11,0.2)', textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f59e0b' }}>₦{cashValue.toLocaleString()}</div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: 600 }}>Cash/Airtime</div>
            </div>
            <div style={{
              flex: 1, padding: '8px 10px', borderRadius: 10, background: 'rgba(129,140,248,0.1)',
              border: '1px solid rgba(129,140,248,0.2)', textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#818cf8' }}>₦200</div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: 600 }}>Per Friend</div>
            </div>
          </div>

          {/* Progress to payout */}
          {cashValue < minPayout && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: 4 }}>
                <span>🎯 {referralsNeeded} more = ₦{minPayout.toLocaleString()} payout</span>
                <span style={{ fontWeight: 700, color: progress > 0 ? 'var(--gold)' : 'var(--text-dim)' }}>{Math.round(progress)}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)' }}>
                <div style={{
                  height: '100%', borderRadius: 3, width: `${progress}%`,
                  background: 'linear-gradient(90deg, #f59e0b, #10b981)',
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
          )}

          {/* Copy link */}
          <div style={{
            display: 'flex', gap: 8, marginBottom: 12,
            background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4,
            border: '1px solid var(--border)',
          }}>
            <input readOnly value={referralLink} style={{
              flex: 1, padding: '8px 12px', border: 'none', background: 'transparent',
              color: 'var(--text)', fontSize: '0.78rem', outline: 'none', minWidth: 0,
            }} />
            <button onClick={handleCopy} style={{
              padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: '0.8rem', whiteSpace: 'nowrap',
              background: copied ? '#10b981' : 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff', transition: 'all 0.2s',
              transform: copied ? 'scale(1.05)' : 'scale(1)',
            }}>
              {copied ? '✅ Copied!' : '📋 Copy Link'}
            </button>
          </div>

          {/* Share buttons */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 10 }}>
            {SHARE_PLATFORMS.map(p => (
              <button key={p.name} onClick={() => handleShare(p)} style={{
                flex: 1, padding: '10px 6px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: p.name === 'X' ? '#000' : `${p.color}20`, 
                color: p.name === 'X' ? '#fff' : p.color,
                fontSize: '0.72rem', fontWeight: 700,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                transition: 'transform 0.2s',
              }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <span style={{ fontSize: 18 }}>{p.icon}</span>
                <span>{p.name}</span>
              </button>
            ))}
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-dim)', margin: 0, lineHeight: 1.4 }}>
            💡 Each friend who pays through your link earns you <strong style={{ color: '#10b981' }}>₦200 cash or airtime</strong> — your choice
          </p>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes popIn { from { opacity:0; transform:translate(-50%,-50%) scale(0.8) } to { opacity:1; transform:translate(-50%,-50%) scale(1) } }
        @keyframes bounce { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-8px) } }
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity:1 }
          100% { transform: translateY(400px) rotate(720deg); opacity:0 }
        }
      `}
      </style>
    </>
  );
}
