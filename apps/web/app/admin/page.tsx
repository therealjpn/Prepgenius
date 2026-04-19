'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { useToast } from '@/components/Toast';

const PERIODS = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: 'year', label: 'This Year' },
  { key: 'all', label: 'All Time' },
];

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [tab, setTab] = useState<'metrics' | 'users' | 'tickets'>('metrics');
  const [period, setPeriod] = useState('all');
  const [metrics, setMetrics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [userTotal, setUserTotal] = useState(0);
  const [tickets, setTickets] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [replyText, setReplyText] = useState<Record<number, string>>({});

  const fetchMetrics = useCallback(async (p: string) => {
    setMetricsLoading(true);
    try {
      const m = await api.adminMetrics(p);
      setMetrics(m);
    } catch (err: any) {
      if (err.message?.includes('Admin')) router.push('/');
    } finally {
      setMetricsLoading(false);
    }
  }, [router]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [m, u, t] = await Promise.all([
        api.adminMetrics(period),
        api.adminUsers(search),
        api.adminTickets(),
      ]);
      setMetrics(m);
      setUsers(u.users);
      setUserTotal(u.total);
      setTickets(t);
    } catch (err: any) {
      if (err.message?.includes('Admin')) router.push('/');
    } finally {
      setLoading(false);
    }
  }, [search, period, router]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }
    if (!(user as any).isAdmin) { router.push('/'); return; }
    fetchData();
  }, [user, authLoading, router, fetchData]);

  const handlePeriodChange = (p: string) => {
    setPeriod(p);
    fetchMetrics(p);
  };

  const handleTogglePaid = async (userId: number) => {
    setActionLoading(userId);
    try {
      const result = await api.adminTogglePaid(userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isPaid: result.isPaid } : u));
      fetchMetrics(period); // Refresh metrics
    } catch (err: any) { showToast(err.message, 'error'); }
    finally { setActionLoading(null); }
  };

  const handleToggleBan = async (userId: number) => {
    setActionLoading(userId);
    try {
      const result = await api.adminToggleBan(userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBanned: result.isBanned } : u));
    } catch (err: any) { showToast(err.message, 'error'); }
    finally { setActionLoading(null); }
  };

  const handleResolve = async (ticketId: number) => {
    setActionLoading(ticketId);
    try {
      await api.adminResolveTicket(ticketId);
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'resolved' } : t));
      setMetrics((prev: any) => prev ? { ...prev, openTickets: Math.max(0, prev.openTickets - 1) } : prev);
    } catch (err: any) { showToast(err.message, 'error'); }
    finally { setActionLoading(null); }
  };

  const handleReply = async (ticketId: number) => {
    const reply = replyText[ticketId]?.trim();
    if (!reply) return;
    setActionLoading(ticketId);
    try {
      await api.adminReplyTicket(ticketId, reply);
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, adminReply: reply } : t));
      setReplyText(prev => ({ ...prev, [ticketId]: '' }));
    } catch (err: any) { showToast(err.message, 'error'); }
    finally { setActionLoading(null); }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  if (authLoading || loading) return <div className="loading-container"><div className="spinner" /><p>Loading admin dashboard...</p></div>;

  return (
    <div className="page-container" style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems:'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-bright)', margin: 0 }}>🛡️ Admin Dashboard</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: 4 }}>Manage users, view metrics & resolve support tickets</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['metrics', 'users', 'tickets'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{
                padding: '8px 16px', borderRadius: 10, fontSize: '0.85rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                background: tab === t ? 'var(--green)' : 'var(--bg-card)',
                color: tab === t ? '#fff' : 'var(--text-dim)',
                transition: 'all 0.2s',
              }}>
              {t === 'metrics' ? '📊 Metrics' : t === 'users' ? '👥 Users' : '🎫 Tickets'}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Tab */}
      {tab === 'metrics' && metrics && (
        <div>
          {/* Period Filter */}
          <div style={{
            display: 'flex', gap: 6, marginBottom: 20, padding: 4,
            background: 'var(--bg-card)', borderRadius: 12, width: 'fit-content',
            border: '1px solid var(--border)',
          }}>
            {PERIODS.map(p => (
              <button key={p.key} onClick={() => handlePeriodChange(p.key)}
                style={{
                  padding: '6px 14px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600,
                  border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                  background: period === p.key ? 'var(--green)' : 'transparent',
                  color: period === p.key ? '#fff' : 'var(--text-dim)',
                }}>
                {p.label}
              </button>
            ))}
          </div>

          {metricsLoading && (
            <div style={{ textAlign: 'center', padding: 12 }}>
              <div className="spinner" style={{ width: 20, height: 20, margin: '0 auto' }} />
            </div>
          )}

          {/* Period-specific cards */}
          <div style={{ marginBottom: 12, fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            {period === 'all' ? 'All-time metrics' : `Filtered: ${PERIODS.find(p => p.key === period)?.label}`}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
            <MetricCard
              label={period === 'all' ? 'Total Revenue' : 'Revenue'}
              value={`₦${(metrics.revenueNgn || 0).toLocaleString()}`}
              icon="💵" color="#10b981"
              subtitle={period !== 'all' ? `All-time: ₦${(metrics.totalRevenueNgnAll || 0).toLocaleString()}` : undefined}
            />
            <MetricCard
              label={period === 'all' ? 'Total Signups' : 'New Signups'}
              value={metrics.newSignups}
              icon="👥" color="var(--green-light)"
              subtitle={period !== 'all' ? `All-time: ${metrics.totalUsersAll}` : undefined}
            />
            <MetricCard
              label={period === 'all' ? 'Paid Users' : 'New Paid'}
              value={metrics.newPaidUsers}
              icon="💰" color="var(--gold)"
              subtitle={period !== 'all' ? `All-time: ${metrics.paidUsersAll}` : undefined}
            />
            <MetricCard label="Conversion Rate" value={`${metrics.conversionRate}%`} icon="📈" color="#818cf8" />
            <MetricCard
              label={period === 'all' ? 'Total Payments' : 'Payments'}
              value={metrics.paymentsCount || 0}
              icon="🧾" color="#a78bfa"
            />
            <MetricCard label="Banned Users" value={metrics.bannedUsers} icon="🚫" color="#ef4444" />
            <MetricCard label="Open Tickets" value={metrics.openTickets} icon="🎫" color="#f59e0b" />
          </div>
        </div>
      )}

      {/* Users Table */}
      {tab === 'users' && (
        <div>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <input
              type="text" placeholder="Search by name or email..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1, padding: '10px 16px', borderRadius: 10,
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                color: 'var(--text)', fontSize: '0.9rem', outline: 'none',
              }}
            />
            <button type="submit" className="btn btn-primary btn-sm">🔍 Search</button>
          </form>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: 12 }}>
            Showing {users.length} of {userTotal} users
          </div>

          <div style={{ overflowX: 'auto', borderRadius: 14, border: '1px solid var(--border)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead>
                <tr style={{ background: 'var(--bg-card)' }}>
                  {['Name', 'Email', 'Status', 'Coins', 'Refs', 'Joined', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="nav-avatar" style={{ width: 28, height: 28, fontSize: 12 }}>{u.fullName?.charAt(0)}</div>
                        <span style={{ color: 'var(--text-bright)', fontWeight: 600, fontSize: '0.85rem' }}>{u.fullName}</span>
                        {u.isAdmin && <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: 6, background: 'rgba(139,92,246,0.2)', color: '#a78bfa' }}>Admin</span>}
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>{u.email}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {u.isBanned && <StatusBadge text="Banned" color="#ef4444" />}
                        {u.isPaid ? <StatusBadge text="Paid" color="#10b981" /> : <StatusBadge text="Free" color="#6b7280" />}
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--gold)', fontWeight: 700, fontSize: '0.85rem' }}>{u.geniuscoins}🪙</td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>{u.referralCount}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <ActionBtn
                          onClick={() => handleTogglePaid(u.id)}
                          loading={actionLoading === u.id}
                          color={u.isPaid ? '#f59e0b' : '#10b981'}
                          label={u.isPaid ? '⬇ Downgrade' : '⬆ Upgrade'}
                        />
                        {!u.isAdmin && (
                          <ActionBtn
                            onClick={() => handleToggleBan(u.id)}
                            loading={actionLoading === u.id}
                            color={u.isBanned ? '#10b981' : '#ef4444'}
                            label={u.isBanned ? '✅ Unban' : '🚫 Ban'}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Support Tickets */}
      {tab === 'tickets' && (
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: 16 }}>
            {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} total • {tickets.filter(t => t.status === 'open').length} open
          </div>

          {tickets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-dim)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
              <p>No support tickets yet!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {tickets.map(t => (
                <div key={t.id} style={{
                  padding: '16px 20px', borderRadius: 14,
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  opacity: t.status === 'resolved' ? 0.6 : 1,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-bright)', fontSize: '0.95rem' }}>{t.subject}</span>
                        <StatusBadge text={t.status} color={t.status === 'open' ? '#f59e0b' : '#10b981'} />
                      </div>
                      <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', margin: '0 0 6px' }}>{t.message}</p>
                      {t.adminReply && (
                        <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(139,92,246,0.08)', borderLeft: '3px solid #a78bfa', margin: '8px 0', fontSize: '0.85rem', color: 'var(--text)' }}>
                          <span style={{ fontSize: '0.7rem', color: '#a78bfa', fontWeight: 600 }}>Your reply:</span><br/>{t.adminReply}
                        </div>
                      )}
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        👤 {t.user?.fullName} ({t.user?.email}) • {new Date(t.createdAt).toLocaleDateString('en-NG')}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 120 }}>
                      {t.status === 'open' && !t.adminReply && (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <input
                            placeholder="Reply..." value={replyText[t.id] || ''}
                            onChange={(e) => setReplyText(prev => ({ ...prev, [t.id]: e.target.value }))}
                            style={{ flex: 1, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '0.75rem', outline: 'none', minWidth: 80 }}
                          />
                          <button onClick={() => handleReply(t.id)} disabled={actionLoading === t.id || !replyText[t.id]?.trim()}
                            style={{ padding: '4px 8px', borderRadius: 6, border: 'none', cursor: 'pointer', background: 'rgba(139,92,246,0.15)', color: '#a78bfa', fontWeight: 600, fontSize: '0.7rem' }}>
                            💬
                          </button>
                        </div>
                      )}
                      {t.status === 'open' && (
                        <button onClick={() => handleResolve(t.id)} disabled={actionLoading === t.id}
                          style={{ padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'rgba(16,185,129,0.15)', color: '#10b981', fontWeight: 600, fontSize: '0.8rem' }}>
                          {actionLoading === t.id ? '...' : '✅ Resolve'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Helper Components ──────────────────────────────────────────
function MetricCard({ label, value, icon, color, subtitle }: { label: string; value: string | number; icon: string; color: string; subtitle?: string }) {
  return (
    <div style={{
      padding: 20, borderRadius: 14, background: 'var(--bg-card)', border: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 20 }}>{icon}</span>
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      {subtitle && <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: 2 }}>{subtitle}</div>}
    </div>
  );
}

function StatusBadge({ text, color }: { text: string; color: string }) {
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700,
      background: `${color}20`, color, textTransform: 'capitalize',
    }}>{text}</span>
  );
}

function ActionBtn({ onClick, loading, color, label }: { onClick: () => void; loading: boolean; color: string; label: string }) {
  return (
    <button onClick={onClick} disabled={loading}
      style={{
        padding: '4px 10px', borderRadius: 8, border: 'none', cursor: loading ? 'wait' : 'pointer',
        background: `${color}18`, color, fontWeight: 600, fontSize: '0.75rem',
        transition: 'all 0.2s', opacity: loading ? 0.5 : 1,
      }}>
      {loading ? '...' : label}
    </button>
  );
}
