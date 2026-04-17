'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResultsPage() {
  const [data, setData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const raw = sessionStorage.getItem('pg_results');
    if (!raw) { router.push('/subjects'); return; }
    setData(JSON.parse(raw));
  }, [router]);

  if (!data) return <div className="loading-container"><div className="spinner" /><p>Loading results...</p></div>;

  const { results, score, demo } = data;
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (score.percentage / 100) * circumference;
  const title = score.percentage >= 80 ? '🎉 Excellent!' : score.percentage >= 60 ? '👍 Good Job!' : score.percentage >= 40 ? '📚 Keep Practicing!' : '💪 Don\'t Give Up!';

  return (
    <div className="page-container">
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div className="score-card">
          <div className="score-ring-container">
            <svg className="score-ring" viewBox="0 0 120 120">
              <defs>
                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#008751" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>
              <circle className="score-ring-bg" cx="60" cy="60" r="52" />
              <circle className="score-ring-fill" cx="60" cy="60" r="52" stroke="url(#scoreGrad)"
                strokeDasharray={circumference} strokeDashoffset={offset} />
            </svg>
            <div className="score-text">{score.percentage}%</div>
          </div>
          <h2 className="score-title">{title}</h2>
          <p className="score-subtitle">You scored {score.correct} out of {score.total}</p>
          <div className="score-details">
            <span className="score-detail" style={{ color: 'var(--green-light)' }}>✅ {score.correct} Correct</span>
            <span className="score-detail" style={{ color: 'var(--red)' }}>❌ {score.total - score.correct} Incorrect</span>
            {!demo && <span className="score-detail" style={{ color: 'var(--gold)' }}>⭐ +{score.pointsEarned} pts</span>}
          </div>
        </div>

        {/* DEMO CTA — Sign Up Prompt */}
        {demo && (
          <div style={{
            padding: '32px',
            borderRadius: 16,
            background: 'linear-gradient(135deg, rgba(0,135,81,0.1), rgba(99,102,241,0.1))',
            border: '1px solid rgba(0,135,81,0.3)',
            textAlign: 'center',
            marginBottom: 32,
          }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-bright)', marginBottom: 8 }}>
              🚀 That was just 5 questions!
            </h3>
            <p style={{ color: 'var(--text-dim)', marginBottom: 8, lineHeight: 1.6 }}>
              Unlock <strong style={{ color: 'var(--green-light)' }}>20,000+ WAEC & NECO past questions</strong> across 8+ subjects with detailed explanations.
            </p>
            <p style={{ color: 'var(--text-dim)', marginBottom: 20, lineHeight: 1.6 }}>
              Join thousands of Nigerian students competing on the <strong style={{ color: 'var(--gold)' }}>weekly leaderboard</strong> and win airtime rewards every week!
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
              <div style={{ padding: '10px 16px', borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '1.25rem' }}>🥇</div>
                <div style={{ fontWeight: 700, color: 'var(--gold)' }}>₦1,000</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>1st Place</div>
              </div>
              <div style={{ padding: '10px 16px', borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '1.25rem' }}>🥈</div>
                <div style={{ fontWeight: 700, color: '#c0c0c0' }}>₦500</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>2nd Place</div>
              </div>
              <div style={{ padding: '10px 16px', borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '1.25rem' }}>🥉</div>
                <div style={{ fontWeight: 700, color: '#cd7f32' }}>₦300</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>3rd Place</div>
              </div>
            </div>
            <Link href="/login" className="btn btn-primary btn-lg" style={{ marginRight: 8 }}>
              Sign Up Now — ₦2,000 Only
            </Link>
            <Link href="/leaderboard" className="btn btn-glass btn-lg">
              🏆 View Leaderboard
            </Link>
          </div>
        )}

        <div className="review-section">
          <h3>Question Review</h3>
          {results.map((r: any, i: number) => (
            <div key={i} className={`review-item ${r.isCorrect ? 'correct' : 'incorrect'}`}>
              <div className="review-q">{i + 1}. {r.question}</div>
              <div className={`review-answer ${r.isCorrect ? 'correct-text' : 'wrong-text'}`}>
                Your answer: {r.userAnswer || '(skipped)'}
              </div>
              {!r.isCorrect && (
                <div className="review-answer correct-text">Correct answer: {r.correctAnswer}</div>
              )}
              <div className="review-explanation">💡 {r.explanation}</div>
            </div>
          ))}
        </div>

        <div className="results-actions">
          {demo ? (
            <>
              <Link href="/login" className="btn btn-primary btn-lg">🚀 Sign Up & Start Competing</Link>
              <Link href="/subjects" className="btn btn-glass btn-lg">🔄 Try Another Subject</Link>
            </>
          ) : (
            <>
              <Link href="/subjects" className="btn btn-primary btn-lg">📚 Practice More</Link>
              <Link href="/leaderboard" className="btn btn-glass btn-lg">🏆 Leaderboard</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
