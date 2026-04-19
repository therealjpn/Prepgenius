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
  const [savingPhone, setSavingPhone] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }

    api.getReferralDashboard()
      .then(data => { setDashboard(data); setPhone(data.payoutInfo?.phone || ''); setNetwork(data.payoutInfo?.network || ''); })
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
    showToast('Referral link copied!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = `I'm using PrepGenie to prep for WAEC/NECO — 20,000+ past questions with explanations. Sign up with my link and we both save ₦100. ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const savePayoutInfo = async () => {
    setSavingPhone(true);
    try {
      await api.updatePayoutInfo(phone, network);
      showToast('Payout info saved!', 'success');
      // Refresh
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
  const minPayout = wallet?.minPayoutCoins || 1000;
  const coinsNeeded = Math.max(0, minPayout - balance);
  const progress = Math.min(100, (balance / minPayout) * 100);
  const nextPayoutDate = wallet?.nextRedeemableDate ? new Date(wallet.nextRedeemableDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }) : 'End of month';
  const paidReferrals = referrals.filter((r: any) => r.status === 'Paid').length;

  return (
    <div className="page-container">
      <div style={{ maxWidth: 700, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🎁</div>
          <h1 style={{ color: 'var(--text-bright)', fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>Invite Friends</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Every friend who signs up with your link gets <strong style={{ color: 'var(--green-light)' }}>₦100 off</strong> and earns you{' '}
            <strong style={{ color: 'var(--gold)' }}>200 Genius Coins</strong>. Reach 1,000 coins (5 referrals) and we send you airtime at the end of the month.
            Coins below 1,000 roll over.
          </p>
        </div>

        {/* Phone/network missing banner */}
        {!payoutInfo?.phone && balance > 0 && (
          <div style={{
            padding: '14px 18px', marginBottom: 24, borderRadius: 12,
            background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
            color: 'var(--gold)', fontSize: '0.85rem', textAlign: 'center',
          }}>
            ⚠️ Add your phone number and network below to receive airtime at month-end.
          </div>
        )}

        {/* Referral Link */}
        <div style={{
          padding: 24, marginBottom: 24, borderRadius: 16,
          background: 'linear-gradient(135deg, rgba(0,135,81,0.08), rgba(16,185,129,0.12))',
          border: '1px solid rgba(0,135,81,0.25)',
        }}>
          <h3 style={{ color: 'var(--text-bright)', margin: '0 0 12px', fontSize: '1rem' }}>🔗 Your Referral Link</h3>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              readOnly value={referralLink}
              style={{ flex: 1, padding: '10px 14px', borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '0.85rem', outline: 'none' }}
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button className="btn btn-primary btn-sm" onClick={copyLink}>
              {copied ? '✅ Copied!' : '📋 Copy'}
            </button>
          </div>
          <button className="btn btn-sm" onClick={shareWhatsApp} style={{
            width: '100%', padding: '10px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: '#25D366', color: '#fff', fontWeight: 700, fontSize: '0.85rem',
          }}>
            💬 Share on WhatsApp
          </button>
        </div>

        {/* Coin Balance + Payout Progress */}
        <div style={{
          padding: 24, marginBottom: 24, borderRadius: 16,
          background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(245,158,11,0.08))',
          border: '1px solid var(--border)',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
            <div style={{ textAlign: 'center', padding: 16, borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--gold)' }}>{balance.toLocaleString()}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Genius Coins</div>
            </div>
            <div style={{ textAlign: 'center', padding: 16, borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--green-light)' }}>₦{balance.toLocaleString()}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Airtime Value</div>
            </div>
            <div style={{ textAlign: 'center', padding: 16, borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)' }}>{paidReferrals}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Paid Referrals</div>
            </div>
          </div>

          {/* Payout progress */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: 6 }}>
              <span>🎯 Payout threshold: {minPayout.toLocaleString()} coins</span>
              <span>{balance.toLocaleString()}/{minPayout.toLocaleString()}</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.06)' }}>
              <div style={{
                height: '100%', borderRadius: 4, width: `${progress}%`,
                background: progress >= 100 ? 'linear-gradient(90deg, #10b981, #06b6d4)' : 'linear-gradient(90deg, #f59e0b, #ef4444)',
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>

          <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', textAlign: 'center', marginTop: 8 }}>
            {balance >= minPayout ? (
              <span style={{ color: 'var(--green-light)' }}>
                ✅ Next payout: <strong>{nextPayoutDate}</strong> — you&apos;ll receive <strong>₦{balance.toLocaleString()}</strong> airtime
              </span>
            ) : (
              <span>
                You need <strong style={{ color: 'var(--gold)' }}>{coinsNeeded.toLocaleString()} more coins</strong> ({Math.ceil(coinsNeeded / 200)} more referrals) to qualify for {nextPayoutDate}&apos;s payout
              </span>
            )}
          </div>
        </div>

        {/* Phone/Network for payout */}
        <div style={{
          padding: 24, marginBottom: 24, borderRadius: 16,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
        }}>
          <h3 style={{ color: 'var(--text-bright)', margin: '0 0 4px', fontSize: '1rem' }}>📱 Airtime Payout Info</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginBottom: 16 }}>We need your phone number and network to send airtime at month-end.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 4 }}>Phone Number</label>
              <input
                type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="08012345678"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '0.85rem', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 4 }}>Network</label>
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
          <button className="btn btn-primary btn-sm" onClick={savePayoutInfo} disabled={savingPhone || !phone || !network} style={{ width: '100%' }}>
            {savingPhone ? 'Saving...' : payoutInfo?.phone ? '✅ Update Payout Info' : 'Save Payout Info'}
          </button>
          {payoutInfo?.phone && (
            <div style={{ marginTop: 8, fontSize: '0.78rem', color: 'var(--green-light)', textAlign: 'center' }}>
              ✅ Saved: {payoutInfo.phone} ({payoutInfo.network})
            </div>
          )}
        </div>

        {/* Referrer Leaderboard */}
        {leaderboard?.leaderboard?.length > 0 && (
          <div style={{
            padding: 24, marginBottom: 24, borderRadius: 16,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
          }}>
            <h3 style={{ color: 'var(--text-bright)', margin: '0 0 16px', fontSize: '1rem' }}>
              🏆 Top Referrers — {new Date().toLocaleDateString('en-NG', { month: 'long', year: 'numeric' })}
            </h3>
            {userRank && (
              <div style={{
                padding: '10px 14px', marginBottom: 12, borderRadius: 10,
                background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                fontSize: '0.82rem', color: '#818cf8', textAlign: 'center',
              }}>
                Your rank: <strong>#{userRank}</strong> with <strong>{paidReferrals} referrals</strong>
                {userRank <= 3 && ' 🎉 Bonus coins incoming!'}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {leaderboard.leaderboard.map((entry: any) => {
                const medals = ['🥇', '🥈', '🥉'];
                const bonuses = ['2,000', '1,000', '500'];
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
                    <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '0.85rem' }}>
                      {entry.referrals} referrals
                    </span>
                    {entry.rank <= 3 && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--green-light)', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: 6 }}>
                        +{bonuses[entry.rank - 1]} coins
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Your Referrals */}
        <div style={{
          padding: 24, marginBottom: 24, borderRadius: 16,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
        }}>
          <h3 style={{ color: 'var(--text-bright)', margin: '0 0 16px', fontSize: '1rem' }}>
            👥 Your Referrals ({referrals.length})
          </h3>
          {referrals.length === 0 ? (
            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', textAlign: 'center', padding: 20 }}>
              No referrals yet. Share your link to get started!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {referrals.map((r: any, i: number) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px',
                  borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--border)',
                }}>
                  <span style={{ color: 'var(--text-bright)', fontWeight: 600, fontSize: '0.85rem' }}>{r.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className={`subject-badge ${r.status === 'Paid' ? 'badge-aloc' : 'badge-local'}`} style={{ fontSize: '0.72rem' }}>
                      {r.status === 'Paid' ? '✅ Paid' : '⏳ Pending'}
                    </span>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>
                      {new Date(r.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
