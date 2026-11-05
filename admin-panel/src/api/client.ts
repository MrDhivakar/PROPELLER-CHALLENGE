import type {
  AdminUser, DashboardStats, LogEntry, Report, Submission, Task, User,
} from './types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:10000/api/v1';
const TOKEN_KEY = 'propeller_admin_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

async function req<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string> | undefined),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  const text = await res.text();
  let body: any = null;
  try { body = text ? JSON.parse(text) : null; } catch { /* non-JSON */ }

  if (!res.ok) {
    if (res.status === 401) { clearToken(); }
    const msg = body?.error?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  if (body?.success === true && body.data !== undefined) return body.data as T;
  throw new Error('Unexpected response shape');
}

// --- Auth ---
export const adminLogin = (email: string, password: string) =>
  req<{ accessToken: string; admin: AdminUser; expiresIn: string }>(
    '/admin/auth/login',
    { method: 'POST', body: JSON.stringify({ email, password }) }
  );

// --- Dashboard ---
export const getDashboard = () => req<DashboardStats>('/admin/dashboard');

// --- Users ---
export const listUsers = (params?: { status?: string; limit?: number; skip?: number }) => {
  const q = new URLSearchParams();
  if (params?.status) q.set('status', params.status);
  if (params?.limit) q.set('limit', String(params.limit));
  if (params?.skip) q.set('skip', String(params.skip));
  const s = q.toString();
  return req<{ total: number; users: User[] }>(`/admin/users${s ? '?' + s : ''}`);
};

export const setUserStatus = (userId: string, status: 'active' | 'suspended', note?: string) =>
  req<{ user: User }>(`/admin/users/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, note }),
  });

// --- Tasks ---
export const listTasks = () => req<{ tasks: Task[] }>('/admin/tasks');

export const createTask = (body: {
  title: string; description: string; category: string;
  difficulty: string; estimatedMinutes: number;
}) => req<{ task: Task }>('/admin/tasks', { method: 'POST', body: JSON.stringify(body) });

export const approveTask = (taskId: string, notes?: string) =>
  req<{ task: Task }>(`/admin/tasks/${taskId}/approve`, {
    method: 'POST', body: JSON.stringify({ notes: notes ?? '' }),
  });

export const rejectTask = (taskId: string, notes?: string) =>
  req<{ task: Task }>(`/admin/tasks/${taskId}/reject`, {
    method: 'POST', body: JSON.stringify({ notes: notes ?? '' }),
  });

export const publishTask = (taskId: string) =>
  req<{ task: Task }>(`/admin/tasks/${taskId}/publish`, {
    method: 'POST', body: JSON.stringify({}),
  });

export const assignTask = (taskId: string, allUsers: boolean, userIds?: string[]) =>
  req<{ assigned: number }>(`/admin/tasks/${taskId}/assign`, {
    method: 'POST',
    body: JSON.stringify({ allUsers, userIds: userIds ?? [] }),
  });

// --- Submissions ---
export const listSubmissions = (status?: string) => {
  const q = status ? `?status=${status}` : '';
  return req<{ total: number; submissions: Submission[] }>(`/admin/submissions${q}`);
};

export const reviewSubmission = (id: string, decision: 'accepted' | 'returned', note?: string) =>
  req<{ submission: Submission }>(`/admin/submissions/${id}/review`, {
    method: 'POST', body: JSON.stringify({ decision, note: note ?? '' }),
  });

// --- Reports ---
export const listReports = () => req<{ reports: Report[] }>('/admin/reports');

export const resolveReport = (id: string, status: 'resolved' | 'dismissed' | 'under_review', note?: string) =>
  req<{ report: Report }>(`/admin/reports/${id}/resolve`, {
    method: 'POST', body: JSON.stringify({ status, note: note ?? '' }),
  });

// --- Logs ---
export const listLogs = (limit?: number) =>
  req<{ logs: LogEntry[] }>(`/admin/logs${limit ? `?limit=${limit}` : ''}`);

// ---------------------------------------------------------
// NEW: LOCATION GAMES & CARDS MANAGEMENT
// ---------------------------------------------------------

export const listCards = () => req<{ cards: any[] }>('/admin/games/cards');

export const createCard = (body: { cardId: string; name: string; level: number; imageUrl: string; description?: string }) => 
  req<{ card: any }>('/admin/games/cards', { method: 'POST', body: JSON.stringify(body) });

export const listGames = () => req<{ games: any[] }>('/admin/games');

export const createGame = (body: {
  title: string; description: string; startTime: string; endTime: string;
  location: { type: 'Point'; coordinates: [number, number] };
  rewardCardId: string;
}) => req<{ game: any }>('/admin/games', { method: 'POST', body: JSON.stringify(body) });

export const getLiveParticipants = (gameId: string) => 
  req<{ participants: any[] }>(`/admin/games/${gameId}/live`);

export const declareWinner = (gameId: string, participantId: string) =>
  req<{ message: string }>(`/admin/games/${gameId}/winner`, {
    method: 'POST',
    body: JSON.stringify({ participantId }),
  });
