const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('pg_token');
}

async function request(path: string, options: RequestInit = {}): Promise<any> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Request failed');
  return data;
}

export const api = {
  // Auth
  signup: (email: string, password: string, fullName: string) =>
    request('/api/auth/signup', { method: 'POST', body: JSON.stringify({ email, password, fullName }) }),
  login: (email: string, password: string) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  googleAuth: (data: { email: string; googleId: string; name?: string; picture?: string }) =>
    request('/api/auth/google', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/api/auth/me'),

  // Subjects
  getSubjects: () => request('/api/subjects'),

  // Exam
  startExam: (data: { subject: string; examType?: string; year?: string; questionCount?: number }) =>
    request('/api/exam/start', { method: 'POST', body: JSON.stringify(data) }),
  submitExam: (data: { sessionId: number; answers: Record<number, string> }) =>
    request('/api/exam/submit', { method: 'POST', body: JSON.stringify(data) }),

  // Payment
  initializePayment: () => request('/api/payment/initialize', { method: 'POST' }),
  verifyPayment: (reference: string) =>
    request('/api/payment/verify', { method: 'POST', body: JSON.stringify({ reference }) }),
  paymentStatus: () => request('/api/payment/status'),

  // Leaderboard
  getLeaderboard: () => request('/api/leaderboard'),

  // Profile
  getStats: () => request('/api/profile/stats'),
};
