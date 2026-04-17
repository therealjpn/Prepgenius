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

  const { results, score } = data;
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
            <span className="score-detail" style={{ color: 'var(--gold)' }}>⭐ +{score.pointsEarned} pts</span>
          </div>
        </div>

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
          <Link href="/subjects" className="btn btn-primary btn-lg">📚 Practice More</Link>
          <Link href="/leaderboard" className="btn btn-glass btn-lg">🏆 Leaderboard</Link>
        </div>
      </div>
    </div>
  );
}
