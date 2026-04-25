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
  googleAuth: (data: { email: string; googleId: string; name?: string; picture?: string; referralCode?: string }) =>
    request('/api/auth/google', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/api/auth/me'),

  // Subjects
  getSubjects: () => request('/api/subjects'),

  // Exam
  startExam: (data: { subject: string; examType?: string; year?: string; questionCount?: number }) =>
    request('/api/exam/start', { method: 'POST', body: JSON.stringify(data) }),
  submitExam: (data: { sessionId: number; answers: Record<number, string> }) =>
    request('/api/exam/submit', { method: 'POST', body: JSON.stringify(data) }),

  // Demo (no auth)
  getDemoQuestions: (subject: string) => request(`/api/exam/demo?subject=${encodeURIComponent(subject)}`),
  submitDemo: (data: { subject: string; answers: Record<number, string>; questions: any[] }) =>
    request('/api/exam/demo/submit', { method: 'POST', body: JSON.stringify(data) }),

  // Payment
  initializePayment: () => request('/api/payment/initialize', { method: 'POST' }),
  verifyPayment: (reference: string) =>
    request('/api/payment/verify', { method: 'POST', body: JSON.stringify({ reference }) }),
  paymentStatus: () => request('/api/payment/status'),

  // Leaderboard
  getLeaderboard: () => request('/api/leaderboard'),

  // Profile
  getStats: () => request('/api/profile/stats'),
  deleteProfile: () => request('/api/profile/delete', { method: 'DELETE' }),

  // Referral
  getReferralDashboard: () => request('/api/referral/dashboard'),
  getReferralWallet: () => request('/api/referral/wallet'),
  getReferralList: () => request('/api/referral/list'),
  applyReferralCode: (referralCode: string) =>
    request('/api/referral/apply', { method: 'POST', body: JSON.stringify({ referralCode }) }),
  updatePayoutInfo: (phone: string, network: string, bankName?: string, bankAccount?: string, accountName?: string) =>
    request('/api/referral/payout-info', { method: 'POST', body: JSON.stringify({ phone, network, bankName, bankAccount, accountName }) }),
  getReferralLeaderboard: (month?: string) =>
    request(`/api/referral/leaderboard${month ? `?month=${month}` : ''}`),

  // Admin
  adminMetrics: (period?: string) => request(`/api/admin/metrics?period=${period || 'all'}`),
  adminUsers: (search?: string, page?: number, filter?: string) =>
    request(`/api/admin/users?search=${search || ''}&page=${page || 1}&filter=${filter || ''}`),
  adminExportUsers: (search?: string, filter?: string) =>
    request(`/api/admin/users/export?search=${search || ''}&filter=${filter || ''}`),
  adminTogglePaid: (userId: number) =>
    request(`/api/admin/users/${userId}/toggle-paid`, { method: 'PATCH' }),
  adminToggleBan: (userId: number) =>
    request(`/api/admin/users/${userId}/toggle-ban`, { method: 'PATCH' }),
  adminAdjustCoins: (userId: number, amount: number, reason: string) =>
    request(`/api/admin/users/${userId}/adjust-coins`, { method: 'PATCH', body: JSON.stringify({ amount, reason }) }),
  adminReferrals: (flagged?: boolean) =>
    request(`/api/admin/referrals${flagged ? '?flagged=true' : ''}`),
  adminApproveReferral: (id: number) =>
    request(`/api/admin/referrals/${id}/approve`, { method: 'POST' }),
  adminRejectReferral: (id: number, reason: string) =>
    request(`/api/admin/referrals/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }),
  adminCoinTransactions: (page?: number) =>
    request(`/api/admin/coin-transactions?page=${page || 1}`),
  adminPayouts: (month?: string, status?: string) =>
    request(`/api/admin/payouts?month=${month || ''}&status=${status || ''}`),
  adminRunBatch: (month?: string) =>
    request('/api/admin/payouts/run-batch', { method: 'POST', body: JSON.stringify({ month }) }),
  adminMarkPayoutPaid: (id: number) =>
    request(`/api/admin/payouts/${id}/mark-paid`, { method: 'PATCH' }),
  adminRejectPayout: (id: number, reason: string) =>
    request(`/api/admin/payouts/${id}/reject`, { method: 'PATCH', body: JSON.stringify({ reason }) }),
  adminBulkMarkPaid: (payoutIds: number[]) =>
    request('/api/admin/payouts/bulk-mark-paid', { method: 'POST', body: JSON.stringify({ payoutIds }) }),
  adminAuditLog: (page?: number) =>
    request(`/api/admin/audit-log?page=${page || 1}`),
  adminTickets: (status?: string) =>
    request(`/api/admin/tickets${status ? `?status=${status}` : ''}`),
  adminResolveTicket: (ticketId: number, reply?: string) =>
    request(`/api/admin/tickets/${ticketId}/resolve`, { method: 'PATCH', body: JSON.stringify({ reply }) }),
  adminReplyTicket: (ticketId: number, reply: string) =>
    request(`/api/admin/tickets/${ticketId}/reply`, { method: 'PATCH', body: JSON.stringify({ reply }) }),

  // Support (user-facing)
  createTicket: (subject: string, message: string) =>
    request('/api/support/tickets', { method: 'POST', body: JSON.stringify({ subject, message }) }),
  getMyTickets: () => request('/api/support/tickets'),

  // Analytics (admin)
  adminAnalytics: (period?: string) =>
    request(`/api/admin/analytics?period=${period || 'all'}`),
};
