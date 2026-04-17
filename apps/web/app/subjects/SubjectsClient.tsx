'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface Subject {
  name: string; icon: string; color: string; years: string[];
  questionCount: string | number; source: string;
}

export function SubjectsClient() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selected, setSelected] = useState<Subject | null>(null);
  const [examType, setExamType] = useState('WAEC');
  const [questionCount, setQuestionCount] = useState(10);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    api.getSubjects().then(d => { setSubjects(d.subjects); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const startExam = async () => {
    if (!user) return router.push('/login');
    if (!user.isPaid) return router.push('/payment');
    if (!selected) return;
    setStarting(true);
    try {
      const data = await api.startExam({ subject: selected.name, examType, questionCount });
      sessionStorage.setItem('pg_exam', JSON.stringify(data));
      router.push('/exam');
    } catch (err: any) {
      if (err.message?.includes('Payment required')) router.push('/payment');
      else alert(err.message);
    } finally {
      setStarting(false);
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner" /><p>Loading subjects...</p></div>;

  return (
    <div className="page-container">
      <div className="section-header">
        <h1>Choose Your Subject</h1>
        <p>Select a WAEC/NECO subject and start practicing</p>
      </div>

      <div className="subjects-grid">
        {subjects.map(s => (
          <div key={s.name} className={`subject-card ${selected?.name === s.name ? 'selected' : ''}`}
            onClick={() => setSelected(s)} style={{ borderColor: selected?.name === s.name ? s.color : undefined }}>
            <div className="subject-icon">{s.icon}</div>
            <div className="subject-name">{s.name}</div>
            <div className="subject-meta">
              <span className={`subject-badge ${s.source === 'aloc' ? 'badge-aloc' : 'badge-local'}`}>
                {s.source === 'aloc' ? '⚡ ALOC' : '📦 Local'}
              </span>
              <span className="subject-badge badge-count">{s.questionCount} questions</span>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="config-panel">
          <div className="config-header">
            <h3>{selected.icon} {selected.name}</h3>
            <button className="btn btn-sm btn-ghost" onClick={() => setSelected(null)}>✕</button>
          </div>
          <div className="config-group">
            <label className="config-label">Exam Type</label>
            <div className="segmented-control">
              {['WAEC', 'NECO', 'all'].map(t => (
                <button key={t} className={`seg-btn ${examType === t ? 'active' : ''}`} onClick={() => setExamType(t)}>
                  {t === 'all' ? 'Both' : t}
                </button>
              ))}
            </div>
          </div>
          <div className="config-group">
            <label className="config-label">Number of Questions</label>
            <div className="count-control">
              <button className="count-btn" onClick={() => setQuestionCount(Math.max(5, questionCount - 5))}>−</button>
              <span className="count-value">{questionCount}</span>
              <button className="count-btn" onClick={() => setQuestionCount(Math.min(40, questionCount + 5))}>+</button>
            </div>
          </div>
          <button className="btn btn-primary btn-lg btn-full" onClick={startExam} disabled={starting}>
            {starting ? 'Preparing...' : '🚀 Start Exam'}
          </button>
        </div>
      )}
    </div>
  );
}
