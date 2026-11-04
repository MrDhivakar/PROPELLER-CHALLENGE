export type AdminUser = {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

export type User = {
  id: string;
  email: string;
  displayName: string;
  gender: string | null;
  age: number | null;
  country: string | null;
  state: string | null;
  city: string | null;
  accountStatus: 'active' | 'paused' | 'suspended' | 'pending_deletion';
  lastLoginAt: string | null;
  createdAt: string;
};

export type Task = {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estimatedMinutes: number;
  safetyStatus: 'draft' | 'pending_review' | 'approved' | 'rejected';
  publishStatus: 'draft' | 'scheduled' | 'published' | 'archived';
  publishAt: string | null;
  expiresAt: string | null;
  createdAt: string;
};

export type Submission = {
  _id: string;
  status: 'submitted' | 'under_review' | 'accepted' | 'returned';
  textResponse: string;
  createdAt: string;
  reviewedAt: string | null;
  reviewNote: string;
  taskId: { _id: string; title: string } | null;
  userId: { _id: string; email: string; displayName: string } | null;
};

export type Report = {
  _id: string;
  reason: string;
  details: string;
  status: 'open' | 'under_review' | 'resolved' | 'dismissed';
  createdAt: string;
  taskId: { _id: string; title: string } | null;
  reportedBy: { _id: string; email: string; displayName: string } | null;
};

export type LogEntry = {
  _id: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  createdAt: string;
  adminId: { _id: string; email: string } | null;
};

export type DashboardStats = {
  users: number;
  publishedTasks: number;
  pendingSubmissions: number;
  openReports: number;
  recentActivity: LogEntry[];
};