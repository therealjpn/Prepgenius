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
              <div style={{ fontWeight: 700, color: 'var(--green-light)', marginBottom: 2 }}>Refer a Friend, Earn ₦200!</div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                Share your link — earn 10% (₦200) instantly when they pay!
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
            <h3 style={{ color: 'var(--text-bright)', margin: 0 }}>🪙 Geniuscoin Wallet</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', background: 'var(--bg-card)', padding: '4px 10px', borderRadius: 8 }}>
              1 coin = ₦{wallet?.coinValueNgn || 200}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
            <div style={{ textAlign: 'center', padding: 16, borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--gold)' }}>{wallet?.balance || 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Balance</div>
            </div>
            <div style={{ textAlign: 'center', padding: 16, borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--green-light)' }}>₦{wallet?.ngnEquivalent || 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>NGN Value</div>
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
          <div style={{ display: 'flex', gap: 8 }}>
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
          <p style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            Share this link. When someone signs up and pays ₦2,000, you earn 1 Geniuscoin (₦200)!
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
              <p>No referrals yet. Share your link to start earning!</p>
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
              <strong>₦2,000 premium access will be forfeited without a refund</strong>.
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
