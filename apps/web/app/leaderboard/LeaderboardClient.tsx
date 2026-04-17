'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

export function LeaderboardClient() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLeaderboard().then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-container"><div className="spinner" /><p>Loading leaderboard...</p></div>;

  const lb = data?.leaderboard || [];

  return (
    <div className="page-container">
      <div className="section-header">
        <h1>🏆 Weekly Leaderboard</h1>
        <p>{data ? `${data.weekStart} — ${data.weekEnd}` : 'This week\'s rankings'}</p>
      </div>

      <div className="rewards-grid">
        <div className="reward-card gold"><div className="reward-medal">🥇</div><div className="reward-prize">₦1,000 Airtime</div><div className="reward-label">1st Place</div></div>
        <div className="reward-card silver"><div className="reward-medal">🥈</div><div className="reward-prize">₦500 Airtime</div><div className="reward-label">2nd Place</div></div>
        <div className="reward-card bronze"><div className="reward-medal">🥉</div><div className="reward-prize">₦300 Airtime</div><div className="reward-label">3rd Place</div></div>
      </div>

      {lb.length > 0 ? (
        <table className="lb-table">
          <thead><tr><th>Rank</th><th>Student</th><th>Points</th><th>Accuracy</th><th>Exams</th><th>Reward</th></tr></thead>
          <tbody>
            {lb.map((e: any) => (
              <tr key={e.rank}>
                <td className="lb-rank">{e.rank <= 3 ? ['🥇','🥈','🥉'][e.rank-1] : `#${e.rank}`}</td>
                <td className="lb-name">{e.fullName}</td>
                <td className="lb-points">{e.totalPoints}</td>
                <td>{e.accuracy}%</td>
                <td>{e.examsTaken}</td>
                <td>{e.reward || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="empty-state">
          <p>No scores this week yet. Be the first!</p>
          <Link href="/subjects" className="btn btn-primary" style={{ marginTop: 16 }}>Start Practicing</Link>
        </div>
      )}
    </div>
  );
}
