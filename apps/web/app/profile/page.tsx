'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { useToast } from '@/components/Toast';

export default function ProfilePage() {
  const { user, loading: authLoading, logout } = useAuth();
  const [dashboard, setDashboard] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }

    Promise.all([
      api.getReferralDashboard().catch(() => null),
      api.getStats().catch(() => null),
    ]).then(([dash, st]) => {
      setDashboard(dash);
      setStats(st);
      setLoading(false);
    });
  }, [user, authLoading, router]);

  const copyLink = () => {
    if (!dashboard?.referralInfo?.referralLink) return;
    navigator.clipboard.writeText(dashboard.referralInfo.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteProfile = async () => {
    if (confirmText !== 'DELETE') return;
    setDeleting(true);
    try {
      await api.deleteProfile();
      logout();
      router.push('/');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete profile', 'error');
      setDeleting(false);
    }
  };

  if (authLoading || loading) return <div className="loading-container"><div className="spinner" /><p>Loading profile...</p></div>;
  if (!user) return null;

  const wallet = dashboard?.wallet;
  const referrals = dashboard?.referrals || [];
  const showNudge = dashboard?.showNudge;
  const referralLink = dashboard?.referralInfo?.referralLink || '';

  const nextRedeemDate = wallet?.nextRedeemableDate
    ? new Date(wallet.nextRedeemableDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'End of month';

  return (
    <div className="page-container">
      <div style={{ maxWidth: 700, margin: '0 auto' }}>

        {/* Profile Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className="nav-avatar" style={{ width: 64, height: 64, fontSize: 28, margin: '0 auto 12px' }}>
            {user.fullName?.charAt(0).toUpperCase()}
          </div>
          <h2 style={{ color: 'var(--text-bright)', marginBottom: 4 }}>{user.fullName}</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>{user.email}</p>
          <span className={`subject-badge ${user.isPaid ? 'badge-aloc' : 'badge-local'}`} style={{ marginTop: 8, display: 'inline-block' }}>
            {user.isPaid ? '⚡ Premium Member' : '🔒 Free Account'}
          </span>
        </div>

        {/* Referral Nudge Banner */}
        {showNudge && (
          <div style={{
            padding: '16px 20px', marginBottom: 24, borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(0,135,81,0.12), rgba(245,158,11,0.12))',
            border: '1px solid rgba(0,135,81,0.25)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: 28 }}>🎁</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: 'var(--green-light)', marginBottom: 2 }}>Invite Friends, Earn ₦200 Cash or Airtime!</div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                Each friend who pays = <strong style={{ color: 'var(--gold)' }}>₦200</strong> in your pocket — redeemable as cash or airtime 💰
              </div>
            </div>
            <button className="btn btn-sm btn-primary" onClick={copyLink}>Copy Link</button>
          </div>
        )}

        {/* Geniuscoin Wallet */}
        <div style={{
          padding: 24, marginBottom: 24, borderRadius: 16,
          background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(245,158,11,0.08))',
          border: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <h3 style={{ color: 'var(--text-bright)', margin: 0 }}>💰 Earnings Wallet</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', background: 'var(--bg-card)', padding: '4px 10px', borderRadius: 8 }}>
              1 coin = ₦1 • Cash or Airtime
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
            <div style={{ textAlign: 'center', padding: 16, borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--gold)' }}>{wallet?.balance || 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Genius Coins</div>
            </div>
            <div style={{ textAlign: 'center', padding: 16, borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--green-light)' }}>₦{wallet?.ngnEquivalent || 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Cash/Airtime Value</div>
            </div>
            <div style={{ textAlign: 'center', padding: 16, borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)' }}>{wallet?.totalEarned || 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Total Earned</div>
            </div>
          </div>
          <div style={{ marginTop: 12, fontSize: '0.8rem', color: 'var(--text-dim)', textAlign: 'center' }}>
            📅 Next redeemable date: <strong style={{ color: 'var(--gold)' }}>{nextRedeemDate}</strong>
          </div>
        </div>

        {/* Referral Link */}
        <div style={{
          padding: 24, marginBottom: 24, borderRadius: 16,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
        }}>
          <h3 style={{ color: 'var(--text-bright)', margin: '0 0 12px' }}>🔗 Your Referral Link</h3>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              readOnly value={referralLink}
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 10,
                background: 'var(--bg)', border: '1px solid var(--border)',
                color: 'var(--text)', fontSize: '0.85rem', outline: 'none',
              }}
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button className="btn btn-primary btn-sm" onClick={copyLink}>
              {copied ? '✅ Copied!' : '📋 Copy'}
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, marginBottom: 10 }}>
            <button onClick={() => { window.open(`https://wa.me/?text=${encodeURIComponent(`I'm using PrepGenie to ace my WAEC/NECO exams — 20,000+ past questions! Use my link & save ₦100 🔥\n\n${referralLink}`)}`, '_blank'); }} style={{ padding: '8px 4px', borderRadius: 10, border: 'none', cursor: 'pointer', background: '#25D366', color: '#fff', fontWeight: 700, fontSize: '0.7rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </button>
            <button onClick={() => { window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, '_blank'); }} style={{ padding: '8px 4px', borderRadius: 10, border: 'none', cursor: 'pointer', background: '#1877F2', color: '#fff', fontWeight: 700, fontSize: '0.7rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </button>
            <button onClick={() => { window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I'm using PrepGenie to ace my WAEC/NECO exams — 20,000+ past questions! Use my link & save ₦100 🔥\n\n${referralLink}`)}`, '_blank'); }} style={{ padding: '8px 4px', borderRadius: 10, border: 'none', cursor: 'pointer', background: '#000', color: '#fff', fontWeight: 700, fontSize: '0.7rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              X
            </button>
            <button onClick={() => { navigator.clipboard.writeText(`I'm using PrepGenie to ace my WAEC/NECO exams — 20,000+ past questions! Use my link & save ₦100 🔥\n\n${referralLink}`); showToast('📋 Link copied for TikTok!', 'success'); }} style={{ padding: '8px 4px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #25F4EE, #FE2C55)', color: '#fff', fontWeight: 700, fontSize: '0.7rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.43V13a8.16 8.16 0 005.58 2.18v-3.45a4.85 4.85 0 01-3.77-1.72V6.69h3.77z"/></svg>
              TikTok
            </button>
            <button onClick={() => { window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(`I'm using PrepGenie to ace my WAEC/NECO exams — 20,000+ past questions! Use my link & save ₦100 🔥`)}`, '_blank'); }} style={{ padding: '8px 4px', borderRadius: 10, border: 'none', cursor: 'pointer', background: '#0088cc', color: '#fff', fontWeight: 700, fontSize: '0.7rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              Telegram
            </button>
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            Each friend who signs up and pays = <strong style={{ color: 'var(--gold)' }}>₦200 cash or airtime</strong> for you. No limits.
          </p>
        </div>

        {/* Referral Tracking */}
        <div style={{
          padding: 24, marginBottom: 24, borderRadius: 16,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
        }}>
          <h3 style={{ color: 'var(--text-bright)', margin: '0 0 16px' }}>👥 Your Referrals ({referrals.length})</h3>
          {referrals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-dim)' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🤝</div>
              <p>No referrals yet — share your link to start earning ₦200 per friend!</p>
            </div>
          ) : (
            <div style={{ overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 600 }}>Name</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 600 }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((r: any, i: number) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{r.name}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
                          background: r.status === 'Paid' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                          color: r.status === 'Paid' ? 'var(--green-light)' : 'var(--gold)',
                        }}>
                          {r.status === 'Paid' ? '✅ Paid' : '⏳ Pending'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                        {new Date(r.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Exam Stats */}
        {stats && (
          <div style={{
            padding: 24, marginBottom: 24, borderRadius: 16,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
          }}>
            <h3 style={{ color: 'var(--text-bright)', margin: '0 0 16px' }}>📊 Exam Stats</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 12 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--green-light)' }}>{stats.totalExams || 0}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Exams Taken</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gold)' }}>{stats.averageScore || 0}%</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Avg Score</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>{stats.totalPoints || 0}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Points</div>
              </div>
            </div>
          </div>
        )}

        {/* Danger Zone — Delete Profile */}
        <div style={{
          padding: 24, borderRadius: 16, marginTop: 16,
          background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.2)',
        }}>
          <h3 style={{ color: '#ef4444', margin: '0 0 8px', fontSize: '1rem' }}>⚠️ Danger Zone</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', lineHeight: 1.6, margin: '0 0 16px' }}>
            Permanently delete your account and all associated data. This action <strong>cannot be undone</strong>.
          </p>
          <button onClick={() => setShowDeleteModal(true)} style={{
            padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(239,68,68,0.4)',
            background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontWeight: 700,
            fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
          >
            🗑️ Delete My Profile
          </button>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <>
          <div onClick={() => setShowDeleteModal(false)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
            zIndex: 9998,
          }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '92%', maxWidth: 440, zIndex: 9999, padding: '28px 24px',
            background: 'var(--bg-card)', border: '2px solid rgba(239,68,68,0.4)', borderRadius: 20,
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          }}>
            <div style={{ textAlign: 'center', fontSize: 48, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ textAlign: 'center', color: '#ef4444', fontWeight: 800, fontSize: '1.2rem', marginBottom: 12 }}>
              Are you sure?
            </h3>
            <p style={{
              textAlign: 'center', color: 'var(--text)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: 20,
              padding: '12px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
            }}>
              Deleting your profile is <strong>permanent</strong>. You will lose your practice history and your{' '}
              <strong>₦1,000 premium access will be forfeited without a refund</strong>.
            </p>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginBottom: 8, textAlign: 'center' }}>
              Type <strong style={{ color: '#ef4444' }}>DELETE</strong> to confirm:
            </p>
            <input
              value={confirmText} onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10,
                background: 'var(--bg)', border: '1px solid var(--border)',
                color: 'var(--text)', fontSize: '0.9rem', outline: 'none',
                textAlign: 'center', marginBottom: 16,
              }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setShowDeleteModal(false); setConfirmText(''); }} style={{
                flex: 1, padding: '10px 16px', borderRadius: 10, border: '1px solid var(--border)',
                background: 'var(--bg-card)', color: 'var(--text)', fontWeight: 600, cursor: 'pointer',
              }}>
                Cancel
              </button>
              <button onClick={handleDeleteProfile} disabled={confirmText !== 'DELETE' || deleting} style={{
                flex: 1, padding: '10px 16px', borderRadius: 10, border: 'none',
                background: confirmText === 'DELETE' ? '#ef4444' : 'rgba(239,68,68,0.2)',
                color: '#fff', fontWeight: 700, cursor: confirmText === 'DELETE' ? 'pointer' : 'not-allowed',
                opacity: confirmText === 'DELETE' ? 1 : 0.5, transition: 'all 0.2s',
              }}>
                {deleting ? 'Deleting...' : '🗑️ Delete Forever'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
