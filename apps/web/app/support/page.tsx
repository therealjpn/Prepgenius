'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { useToast } from '@/components/Toast';

export default function SupportPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }
    fetchTickets();
  }, [user, authLoading, router]);

  const fetchTickets = async () => {
    try {
      const data = await api.getMyTickets();
      setTickets(data);
    } catch {} finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSubmitting(true);
    try {
      await api.createTicket(subject.trim(), message.trim());
      setSubject(''); setMessage(''); setShowForm(false);
      await fetchTickets();
    } catch (err: any) { showToast(err.message, 'error'); }
    finally { setSubmitting(false); }
  };

  if (authLoading || loading) return <div className="loading-container"><div className="spinner" /><p>Loading...</p></div>;

  return (
    <div className="page-container" style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-bright)', margin: 0 }}>💬 Support</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: 4 }}>Need help? Submit a ticket and we'll respond ASAP.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '✏️ New Ticket'}
        </button>
      </div>

      {/* New Ticket Form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{
          padding: 20, borderRadius: 14, background: 'var(--bg-card)', border: '1px solid var(--border)',
          marginBottom: 24,
        }}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>Subject</label>
            <input
              value={subject} onChange={(e) => setSubject(e.target.value)} required
              placeholder="e.g. Can't access my account"
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)',
                background: 'var(--bg)', color: 'var(--text)', fontSize: '0.9rem', outline: 'none',
              }}
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>Message</label>
            <textarea
              value={message} onChange={(e) => setMessage(e.target.value)} required
              placeholder="Describe your issue in detail..."
              rows={4}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)',
                background: 'var(--bg)', color: 'var(--text)', fontSize: '0.9rem', outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Submitting...' : '📨 Submit Ticket'}
          </button>
        </form>
      )}

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-dim)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎫</div>
          <p>No tickets yet. Click "New Ticket" if you need help.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {tickets.map(t => (
            <div key={t.id} style={{
              padding: '18px 20px', borderRadius: 14,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 700, color: 'var(--text-bright)', fontSize: '0.95rem' }}>{t.subject}</span>
                <span style={{
                  padding: '2px 10px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700,
                  background: t.status === 'open' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
                  color: t.status === 'open' ? '#f59e0b' : '#10b981',
                  textTransform: 'capitalize',
                }}>{t.status}</span>
              </div>

              {/* User message */}
              <div style={{
                padding: '10px 14px', borderRadius: 10, marginBottom: 8,
                background: 'rgba(16,185,129,0.06)', borderLeft: '3px solid var(--green)',
              }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: 4 }}>You</div>
                <p style={{ color: 'var(--text)', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>{t.message}</p>
              </div>

              {/* Admin reply */}
              {t.adminReply && (
                <div style={{
                  padding: '10px 14px', borderRadius: 10, marginBottom: 8,
                  background: 'rgba(139,92,246,0.06)', borderLeft: '3px solid #a78bfa',
                }}>
                  <div style={{ fontSize: '0.7rem', color: '#a78bfa', marginBottom: 4, fontWeight: 600 }}>🛡️ Admin Response</div>
                  <p style={{ color: 'var(--text)', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>{t.adminReply}</p>
                </div>
              )}

              {t.status === 'open' && !t.adminReply && (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic', margin: '4px 0 0' }}>
                  ⏳ Awaiting response from support team...
                </p>
              )}

              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: 6 }}>
                Submitted {new Date(t.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                {t.resolvedAt && ` • Resolved ${new Date(t.resolvedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
