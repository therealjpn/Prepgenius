'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';

const REFERRAL_MESSAGES = [
  { emoji: '🔥', title: 'You\'re on fire!', subtitle: 'Share your link & earn 200 Genius Coins per friend who joins!' },
  { emoji: '💰', title: 'Free airtime is waiting!', subtitle: 'Every friend = 200 Genius Coins (₦200 airtime). It\'s that simple.' },
  { emoji: '🚀', title: 'Help a friend, get rewarded!', subtitle: 'Share PrepGenie & earn coins when they pay. Win-win!' },
  { emoji: '🎯', title: '1 share = 200 coins potential!', subtitle: 'Your classmates need this. Send them your link!' },
  { emoji: '⚡', title: 'Unlock your rewards!', subtitle: 'Top referrers earn thousands in airtime monthly. Start now!' },
  { emoji: '🏆', title: 'Challenge: Share with 5 friends!', subtitle: 'That\'s 1,000 Genius Coins (₦1,000 airtime) if they all join!' },
  { emoji: '💎', title: 'Your link is your goldmine!', subtitle: 'Every share could earn you 200 coins. Don\'t sleep on it!' },
];

const SHARE_PLATFORMS = [
  { name: 'WhatsApp', icon: '💬', color: '#25D366', getUrl: (link: string, text: string) => `https://wa.me/?text=${encodeURIComponent(text + ' ' + link)}` },
  { name: 'Twitter', icon: '🐦', color: '#1DA1F2', getUrl: (link: string, text: string) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}` },
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
    const lastDismissed = localStorage.getItem('pg_referral_popup_dismissed');
    if (lastDismissed) {
      const hours = (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60);
      if (hours < 8) return false; // Don't show again for 8 hours
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

    // Show after delay
    const timer = setTimeout(() => {
      if (shouldShowPopup()) setShow(true);
    }, 5000); // 5 seconds after page load

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
      // Fallback
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
    const shareText = `🎓 I use PrepGenie to practice WAEC & NECO past questions. It's amazing! Join me and get ahead of your exams:`;
    window.open(platform.getUrl(referralLink, shareText), '_blank', 'width=600,height=400');
  };

  const msg = REFERRAL_MESSAGES[msgIndex];

  if (!show || !user || !referralLink) return null;

  const nextMilestone = (Math.floor(referralCount / 5) + 1) * 5;
  const progress = ((referralCount % 5) / 5) * 100;

  return (
    <>
      {/* Overlay */}
      <div onClick={handleDismiss} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        zIndex: 9998, animation: 'fadeIn 0.3s ease',
      }} />

      {/* Popup */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '92%', maxWidth: 420, zIndex: 9999,
        background: 'linear-gradient(145deg, #0f1a14, #0a1f12)',
        border: '2px solid rgba(16,185,129,0.3)', borderRadius: 24,
        padding: '28px 24px', boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(16,185,129,0.1)',
        animation: 'popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        {/* Confetti particles */}
        {confetti && (
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 24, pointerEvents: 'none' }}>
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} style={{
                position: 'absolute',
                width: 8, height: 8, borderRadius: '50%',
                background: ['#10b981', '#f59e0b', '#818cf8', '#ef4444', '#06b6d4'][i % 5],
                left: `${Math.random() * 100}%`, top: '-10px',
                animation: `confettiFall ${0.8 + Math.random() * 0.6}s ease-out forwards`,
                animationDelay: `${Math.random() * 0.3}s`,
              }} />
            ))}
          </div>
        )}

        {/* Close */}
        <button onClick={handleDismiss} style={{
          position: 'absolute', top: 12, right: 14, border: 'none', background: 'none',
          color: 'var(--text-dim)', fontSize: '1.2rem', cursor: 'pointer', padding: 4,
        }}>✕</button>

        {/* Animated emoji */}
        <div style={{
          textAlign: 'center', fontSize: 48, marginBottom: 8,
          animation: 'bounce 1s ease infinite',
        }}>{msg.emoji}</div>

        {/* Title */}
        <h3 style={{
          textAlign: 'center', fontSize: '1.3rem', fontWeight: 800,
          color: 'var(--text-bright)', marginBottom: 4,
          background: 'linear-gradient(135deg, #10b981, #06b6d4)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>{msg.title}</h3>

        <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: 16, lineHeight: 1.4 }}>
          {msg.subtitle}
        </p>

        {/* Stats row */}
        <div style={{
          display: 'flex', gap: 8, marginBottom: 16, justifyContent: 'center',
        }}>
          <div style={{
            padding: '8px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.2)', textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10b981' }}>{referralCount}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Referrals</div>
          </div>
          <div style={{
            padding: '8px 14px', borderRadius: 10, background: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.2)', textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f59e0b' }}>{coins}🪙</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Coins</div>
          </div>
          <div style={{
            padding: '8px 14px', borderRadius: 10, background: 'rgba(129,140,248,0.1)',
            border: '1px solid rgba(129,140,248,0.2)', textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#818cf8' }}>₦{coins.toLocaleString()}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Earned</div>
          </div>
        </div>

        {/* Progress to milestone */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: 4 }}>
            <span>🎯 Next milestone: {nextMilestone} referrals</span>
            <span>{referralCount}/{nextMilestone}</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)' }}>
            <div style={{
              height: '100%', borderRadius: 3, width: `${progress}%`,
              background: 'linear-gradient(90deg, #10b981, #06b6d4)',
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>

        {/* Copy link */}
        <div style={{
          display: 'flex', gap: 8, marginBottom: 14,
          background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4,
          border: '1px solid var(--border)',
        }}>
          <input readOnly value={referralLink} style={{
            flex: 1, padding: '8px 12px', border: 'none', background: 'transparent',
            color: 'var(--text)', fontSize: '0.8rem', outline: 'none', minWidth: 0,
          }} />
          <button onClick={handleCopy} style={{
            padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: '0.8rem', whiteSpace: 'nowrap',
            background: copied ? '#10b981' : 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff', transition: 'all 0.2s',
            transform: copied ? 'scale(1.05)' : 'scale(1)',
          }}>
            {copied ? '✅ Copied!' : '📋 Copy'}
          </button>
        </div>

        {/* Share buttons */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
          {SHARE_PLATFORMS.map(p => (
            <button key={p.name} onClick={() => handleShare(p)} style={{
              flex: 1, padding: '10px 8px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: `${p.color}18`, color: p.color, fontSize: '0.75rem', fontWeight: 700,
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

        <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
          💡 Earn 200 Genius Coins (₦200 airtime) for every friend who pays!
        </p>
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
      `}</style>
    </>
  );
}
