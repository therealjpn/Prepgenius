'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';

const SHARE_PLATFORMS = [
  { name: 'WhatsApp', icon: '💬', color: '#25D366', getUrl: (link: string, text: string) => `https://wa.me/?text=${encodeURIComponent(text + '\n\n' + link)}` },
  { name: 'X', icon: '𝕏', color: '#000', getUrl: (link: string, text: string) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text + '\n\n' + link)}` },
  { name: 'Telegram', icon: '✈️', color: '#0088cc', getUrl: (link: string, text: string) => `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}` },
  { name: 'Facebook', icon: '📘', color: '#1877F2', getUrl: (link: string, text: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}&quote=${encodeURIComponent(text)}` },
];

export function FreeUserReferralPopup() {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [referralLink, setReferralLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [confetti, setConfetti] = useState(false);

  const THRESHOLD = 5;

  const shouldShow = useCallback(() => {
    if (!user || (user as any).isPaid) return false;
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname;
    if (path === '/' || path === '/login' || path === '/signup' || path === '/invite' || path === '/payment') return false;
    // Show once per session
    if (sessionStorage.getItem('pg_free_referral_shown')) return false;
    return true;
  }, [user]);

  useEffect(() => {
    if (!user || (user as any).isPaid) return;

    const fetchData = async () => {
      try {
        const data = await api.getReferralDashboard();
        setReferralLink(data.referralInfo?.referralLink || '');
        const refs = data.referrals || [];
        setTotalCount(refs.length);
        setVerifiedCount(refs.filter((r: any) => r.status === 'Paid').length);
      } catch {}
    };
    fetchData();

    const delay = 10000 + Math.random() * 5000;
    const timer = setTimeout(() => {
      if (shouldShow()) {
        setShow(true);
        sessionStorage.setItem('pg_free_referral_shown', '1');
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [user, shouldShow]);

  const handleDismiss = () => setShow(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
    } catch {
      const input = document.createElement('input');
      input.value = referralLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    setCopied(true);
    setConfetti(true);
    setTimeout(() => setCopied(false), 3000);
    setTimeout(() => setConfetti(false), 2000);
  };

  const handleShare = (platform: typeof SHARE_PLATFORMS[0]) => {
    const text = `I'm using PrepGenie for WAEC/NECO prep — 20,000+ past questions with explanations! Use my link to get ₦100 off. Help me unlock premium! 🔥`;
    window.open(platform.getUrl(referralLink, text), '_blank', 'width=600,height=400');
  };

  if (!show || !user || (user as any).isPaid || !referralLink) return null;

  const progress = Math.min(100, Math.round((verifiedCount / THRESHOLD) * 100));
  const remaining = Math.max(0, THRESHOLD - verifiedCount);

  return (
    <>
      {/* Overlay */}
      <div onClick={handleDismiss} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
        zIndex: 9998, animation: 'freePopFadeIn 0.3s ease',
      }} />

      {/* Popup */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '92%', maxWidth: 440, zIndex: 9999,
        background: 'linear-gradient(160deg, #0c1a2e, #0a1f12, #1a0f2e)',
        border: '2px solid rgba(129,140,248,0.3)', borderRadius: 28,
        padding: 0, boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 60px rgba(129,140,248,0.08)',
        animation: 'freePopIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        overflow: 'hidden',
      }}>
        {/* Confetti */}
        {confetti && (
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 28, pointerEvents: 'none' }}>
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} style={{
                position: 'absolute', width: 8, height: 8, borderRadius: '50%',
                background: ['#10b981', '#818cf8', '#f59e0b', '#06b6d4', '#a78bfa', '#ec4899'][i % 6],
                left: `${Math.random() * 100}%`, top: '-10px',
                animation: `freeConfetti ${0.8 + Math.random() * 0.6}s ease-out forwards`,
                animationDelay: `${Math.random() * 0.3}s`,
              }} />
            ))}
          </div>
        )}

        {/* Header */}
        <div style={{
          padding: '28px 28px 18px', textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(129,140,248,0.12), rgba(16,185,129,0.08), rgba(245,158,11,0.06))',
          borderBottom: '1px solid rgba(129,140,248,0.1)',
        }}>
          <button onClick={handleDismiss} style={{
            position: 'absolute', top: 14, right: 16, border: 'none', background: 'rgba(255,255,255,0.06)',
            color: 'var(--text-dim)', fontSize: '1rem', cursor: 'pointer', padding: '4px 8px',
            borderRadius: 8, transition: 'all 0.2s',
          }}>✕</button>

          <div style={{ fontSize: 56, marginBottom: 8, lineHeight: 1, animation: 'freeBounce 1.2s ease infinite' }}>🎓</div>

          <h3 style={{
            fontSize: '1.3rem', fontWeight: 900, margin: '0 0 8px', lineHeight: 1.25,
            background: 'linear-gradient(135deg, #818cf8, #10b981, #f59e0b)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            No Cash? No Problem!
          </h3>

          <p style={{ color: 'var(--text)', fontSize: '0.88rem', margin: 0, lineHeight: 1.5, maxWidth: 340, marginInline: 'auto' }}>
            Refer <strong style={{ color: '#10b981' }}>5 paying friends</strong> and unlock{' '}
            <strong style={{ color: '#f59e0b' }}>Premium Access</strong> — completely free!
          </p>
        </div>

        <div style={{ padding: '18px 28px 28px' }}>
          {/* How it works */}
          <div style={{
            display: 'flex', gap: 6, marginBottom: 16, justifyContent: 'center',
          }}>
            {[
              { icon: '📤', label: 'Share Link' },
              { icon: '💳', label: 'They Pay' },
              { icon: '👑', label: 'You Get Premium' },
            ].map((step, i) => (
              <div key={i} style={{
                flex: 1, textAlign: 'center', padding: '10px 6px', borderRadius: 12,
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ fontSize: 22, marginBottom: 3 }}>{step.icon}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontWeight: 600 }}>{step.label}</div>
                {i < 2 && (
                  <div style={{
                    position: 'absolute', right: -8, top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--text-dim)', fontSize: '0.7rem',
                  }}>→</div>
                )}
              </div>
            ))}
          </div>

          {/* Progress */}
          <div style={{
            padding: '12px 16px', borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(129,140,248,0.06))',
            border: '1px solid rgba(16,185,129,0.15)', marginBottom: 14,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text)', fontWeight: 600 }}>
                {verifiedCount > 0 ? `🔥 ${remaining} more to go!` : '🎯 Your progress'}
              </span>
              <span style={{
                fontSize: '0.82rem', fontWeight: 800,
                color: progress >= 100 ? '#10b981' : progress > 0 ? '#f59e0b' : 'var(--text-dim)',
              }}>
                {verifiedCount}/{THRESHOLD}
              </span>
            </div>
            <div style={{ height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 5, width: `${progress}%`,
                background: progress >= 100
                  ? '#10b981'
                  : 'linear-gradient(90deg, #818cf8, #10b981)',
                transition: 'width 0.6s ease',
                boxShadow: progress > 0 ? '0 0 12px rgba(16,185,129,0.4)' : 'none',
              }} />
            </div>
            {totalCount > 0 && verifiedCount < totalCount && (
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: 6 }}>
                💡 {totalCount - verifiedCount} friend{totalCount - verifiedCount !== 1 ? 's' : ''} signed up but haven't paid yet — nudge them!
              </div>
            )}
          </div>

          {/* Copy link */}
          <div style={{
            display: 'flex', gap: 6, marginBottom: 12,
            background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 5,
            border: '1px solid var(--border)',
          }}>
            <input readOnly value={referralLink} style={{
              flex: 1, padding: '10px 14px', border: 'none', background: 'transparent',
              color: 'var(--text)', fontSize: '0.78rem', outline: 'none', minWidth: 0,
            }} />
            <button onClick={handleCopy} style={{
              padding: '10px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: '0.82rem', whiteSpace: 'nowrap',
              background: copied ? '#10b981' : 'linear-gradient(135deg, #818cf8, #6366f1)',
              color: '#fff', transition: 'all 0.2s',
              transform: copied ? 'scale(1.05)' : 'scale(1)',
              boxShadow: '0 4px 16px rgba(129,140,248,0.3)',
            }}>
              {copied ? '✅ Copied!' : '📋 Copy Link'}
            </button>
          </div>

          {/* Share buttons */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 14 }}>
            {SHARE_PLATFORMS.map(p => (
              <button key={p.name} onClick={() => handleShare(p)} style={{
                flex: 1, padding: '10px 6px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: p.name === 'X' ? 'rgba(255,255,255,0.08)' : `${p.color}18`,
                color: p.name === 'X' ? '#fff' : p.color,
                fontSize: '0.72rem', fontWeight: 700,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                transition: 'transform 0.2s',
              }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <span style={{ fontSize: 20 }}>{p.icon}</span>
                <span>{p.name}</span>
              </button>
            ))}
          </div>

          {/* Footer note */}
          <div style={{
            textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-dim)',
            lineHeight: 1.5, padding: '8px 12px', borderRadius: 10,
            background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.1)',
          }}>
            ⚠️ Your friends must <strong style={{ color: '#f59e0b' }}>pay for their account</strong> for it to count.
            <br />Once 5 have paid, you get <strong style={{ color: '#10b981' }}>instant premium access</strong>!
          </div>
        </div>
      </div>

      <style>{`
        @keyframes freePopFadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes freePopIn { from { opacity:0; transform:translate(-50%,-50%) scale(0.85) } to { opacity:1; transform:translate(-50%,-50%) scale(1) } }
        @keyframes freeBounce { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-10px) } }
        @keyframes freeConfetti {
          0% { transform: translateY(0) rotate(0deg); opacity:1 }
          100% { transform: translateY(400px) rotate(720deg); opacity:0 }
        }
      `}</style>
    </>
  );
}
