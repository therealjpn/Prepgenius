'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }
    api.getStats().then(setStats).catch(() => {}).finally(() => setLoading(false));
  }, [user, authLoading, router]);

  if (authLoading || loading) return <div className="loading-container"><div className="spinner" /><p>Loading profile...</p></div>;
  if (!user) return null;

  const s = stats?.stats || {};

  return (
    <div className="page-container">
      <div className="profile-header">
        <div className="profile-avatar-lg">{user.fullName?.charAt(0).toUpperCase()}</div>
        <div className="profile-name">{user.fullName}</div>
        <div className="profile-email">{user.email}</div>
        {user.isPaid && <div className="paid-badge">✅ Premium Access</div>}
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon">📝</div><div className="stat-value">{s.totalExams || 0}</div><div className="stat-label">Exams Taken</div></div>
        <div className="stat-card"><div className="stat-icon">📊</div><div className="stat-value">{s.avgScore || 0}%</div><div className="stat-label">Avg Score</div></div>
        <div className="stat-card"><div className="stat-icon">🏆</div><div className="stat-value">{s.bestScore || 0}%</div><div className="stat-label">Best Score</div></div>
        <div className="stat-card"><div className="stat-icon">⭐</div><div className="stat-value">{s.totalPoints || 0}</div><div className="stat-label">Total Points</div></div>
      </div>

      {stats?.leaderboardRank && (
        <div style={{ textAlign: 'center', marginBottom: 32, padding: 16, borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>This week: </span>
          <strong style={{ color: 'var(--green-light)', fontSize: '1.1rem' }}>Rank #{stats.leaderboardRank}</strong>
          <span style={{ color: 'var(--text-dim)', marginLeft: 8 }}>({stats.leaderboardPoints} pts)</span>
        </div>
      )}

      <div>
        <h3 style={{ fontWeight: 700, color: 'var(--text-bright)', marginBottom: 16 }}>Recent Exams</h3>
        <div className="history-list">
          {(stats?.recentSessions || []).length === 0 && (
            <div className="empty-state"><p>No exams taken yet. Start practicing!</p></div>
          )}
          {(stats?.recentSessions || []).map((s: any) => (
            <div key={s.id} className="history-item">
              <div>
                <div className="history-subject">{s.subject}</div>
                <div className="history-date">{s.examType} • {s.correct}/{s.total} correct • {new Date(s.completedAt).toLocaleDateString()}</div>
              </div>
              <div className="history-score">{s.score}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
