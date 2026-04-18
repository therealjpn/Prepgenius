'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface Question {
  id: number; question: string; options: string[];
  topic: string; year: string; exam_type: string;
  correct_answer?: string; explanation?: string;
}

export default function ExamPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [subject, setSubject] = useState('');
  const [examType, setExamType] = useState('');
  const [isDemo, setIsDemo] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const raw = sessionStorage.getItem('pg_exam');
    if (!raw) { router.push('/subjects'); return; }
    const data = JSON.parse(raw);
    setQuestions(data.questions);
    setSessionId(data.sessionId || null);
    setSubject(data.subject);
    setExamType(data.examType || 'DEMO');
    setIsDemo(!!data.demo);
  }, [router]);

  const selectAnswer = (option: string) => {
    setAnswers(prev => ({ ...prev, [current]: option }));
  };

  const handleSubmitClick = () => {
    setSubmitError('');
    setShowSubmitModal(true);
  };

  const submit = async () => {
    setShowSubmitModal(false);
    setSubmitting(true);
    try {
      let data;
      if (isDemo) {
        data = await api.submitDemo({ subject, answers, questions });
      } else {
        data = await api.submitExam({ sessionId: sessionId!, answers });
      }
      sessionStorage.setItem('pg_results', JSON.stringify({ ...data, demo: isDemo }));
      sessionStorage.removeItem('pg_exam');
      router.push('/results');
    } catch (err: any) {
      setSubmitError(err.message);
      setSubmitting(false);
    }
  };

  if (!questions.length) return <div className="loading-container"><div className="spinner" /><p>Loading exam...</p></div>;

  const q = questions[current];
  const progress = ((current + 1) / questions.length) * 100;
  const letters = ['A', 'B', 'C', 'D', 'E'];
  const answered = Object.keys(answers).length;
  const unanswered = questions.length - answered;

  return (
    <div className="page-container">
      <div className="exam-container">
        <div className="exam-header">
          <div className="exam-info">
            <h3>{subject}</h3>
            <span className="exam-badge">{isDemo ? '🎯 FREE DEMO' : examType}</span>
          </div>
        </div>

        {isDemo && (
          <div style={{ marginBottom: 16, padding: '10px 16px', borderRadius: 10, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', fontSize: '0.85rem', color: 'var(--gold)' }}>
            🎯 Demo Mode — 5 free questions. Sign up to unlock 20,000+ questions!
          </div>
        )}

        {submitError && (
          <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: '0.85rem' }}>
            ❌ {submitError}
          </div>
        )}

        <div className="exam-progress">
          <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
          <span className="progress-text">{current + 1} / {questions.length}</span>
        </div>

        <div className="question-dots">
          {questions.map((_, i) => (
            <button key={i} className={`q-dot ${i === current ? 'active' : ''} ${answers[i] ? 'answered' : ''}`}
              onClick={() => setCurrent(i)}>{i + 1}</button>
          ))}
        </div>

        <div className="question-card">
          <div className="question-meta">
            <span>Question {current + 1}</span>
            {q.topic && <span>{q.topic}</span>}
            {q.year && <span>{q.exam_type} {q.year}</span>}
          </div>
          <h3 className="question-text">{q.question}</h3>
          <div className="options-list">
            {q.options.map((opt, i) => (
              <button key={i} className={`option-btn ${answers[current] === opt ? 'selected' : ''}`}
                onClick={() => selectAnswer(opt)}>
                <span className="option-letter">{letters[i]}</span>
                <span>{opt}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="exam-nav">
          <button className="btn btn-glass" onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0}>
            ← Previous
          </button>
          {current < questions.length - 1 ? (
            <button className="btn btn-primary" onClick={() => setCurrent(current + 1)}>
              Next →
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleSubmitClick} disabled={submitting}>
              {submitting ? 'Submitting...' : '✅ Submit Exam'}
            </button>
          )}
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <>
          <div onClick={() => setShowSubmitModal(false)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
            zIndex: 9998, animation: 'fadeIn 0.2s ease',
          }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '92%', maxWidth: 420, zIndex: 9999, padding: '32px 28px',
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20,
            boxShadow: '0 24px 60px rgba(0,0,0,0.5)', animation: 'slideUp 0.25s ease',
          }}>
            <div style={{ textAlign: 'center', fontSize: 56, marginBottom: 16 }}>📝</div>
            <h3 style={{
              textAlign: 'center', color: 'var(--text-bright)', fontWeight: 800,
              fontSize: '1.3rem', marginBottom: 8,
            }}>
              Submit Your Exam?
            </h3>
            <p style={{
              textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.9rem',
              lineHeight: 1.6, marginBottom: 20,
            }}>
              You&apos;re about to submit your <strong style={{ color: 'var(--text-bright)' }}>{subject}</strong> exam.
              This action cannot be undone.
            </p>

            {/* Stats */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20,
            }}>
              <div style={{
                textAlign: 'center', padding: '14px 12px', borderRadius: 12,
                background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
              }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--green-light)' }}>{answered}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 2 }}>Answered</div>
              </div>
              <div style={{
                textAlign: 'center', padding: '14px 12px', borderRadius: 12,
                background: unanswered > 0 ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.08)',
                border: `1px solid ${unanswered > 0 ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)'}`,
              }}>
                <div style={{
                  fontSize: '1.6rem', fontWeight: 800,
                  color: unanswered > 0 ? 'var(--gold)' : 'var(--green-light)',
                }}>{unanswered}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 2 }}>Unanswered</div>
              </div>
            </div>

            {unanswered > 0 && (
              <div style={{
                padding: '10px 14px', borderRadius: 10, marginBottom: 20,
                background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)',
                color: 'var(--gold)', fontSize: '0.82rem', textAlign: 'center', lineHeight: 1.5,
              }}>
                ⚠️ You have <strong>{unanswered} unanswered {unanswered === 1 ? 'question' : 'questions'}</strong>.
                Unanswered questions will be marked wrong.
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowSubmitModal(false)} style={{
                flex: 1, padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)',
                background: 'var(--bg)', color: 'var(--text)', fontWeight: 600,
                fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s',
              }}>
                ← Go Back
              </button>
              <button onClick={submit} style={{
                flex: 1, padding: '12px 16px', borderRadius: 12, border: 'none',
                background: 'var(--green)', color: '#fff', fontWeight: 700,
                fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: '0 4px 14px rgba(0,135,81,0.3)',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,135,81,0.4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,135,81,0.3)'; }}
              >
                ✅ Submit Now
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
