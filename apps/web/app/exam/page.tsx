'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface Question {
  id: number; question: string; options: string[];
  topic: string; year: string; exam_type: string;
}

export default function ExamPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [subject, setSubject] = useState('');
  const [examType, setExamType] = useState('');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const raw = sessionStorage.getItem('pg_exam');
    if (!raw) { router.push('/subjects'); return; }
    const data = JSON.parse(raw);
    setQuestions(data.questions);
    setSessionId(data.sessionId);
    setSubject(data.subject);
    setExamType(data.examType);
  }, [router]);

  const selectAnswer = (option: string) => {
    setAnswers(prev => ({ ...prev, [current]: option }));
  };

  const submit = async () => {
    if (!confirm(`Submit ${Object.keys(answers).length}/${questions.length} answers?`)) return;
    setSubmitting(true);
    try {
      const data = await api.submitExam({ sessionId: sessionId!, answers });
      sessionStorage.setItem('pg_results', JSON.stringify(data));
      sessionStorage.removeItem('pg_exam');
      router.push('/results');
    } catch (err: any) {
      alert(err.message);
      setSubmitting(false);
    }
  };

  if (!questions.length) return <div className="loading-container"><div className="spinner" /><p>Loading exam...</p></div>;

  const q = questions[current];
  const progress = ((current + 1) / questions.length) * 100;
  const letters = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="page-container">
      <div className="exam-container">
        <div className="exam-header">
          <div className="exam-info">
            <h3>{subject}</h3>
            <span className="exam-badge">{examType}</span>
          </div>
        </div>

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
            <button className="btn btn-primary" onClick={submit} disabled={submitting}>
              {submitting ? 'Submitting...' : '✅ Submit Exam'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
