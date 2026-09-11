export interface AdminUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'super_admin' | 'manager' | 'inspector';
  avatarUrl?: string;
  createdAt: string;
  lastLoginAt?: string;
  isTwoFactorEnabled?: boolean;
}

export interface AuthSession {
  token: string;
  user: AdminUser;
  expiresAt: string;
  createdAt: string;
  deviceInfo: {
    browser: string;
    os: string;
    ip: string;
    deviceType: 'desktop' | 'tablet' | 'mobile';
  };
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  category: 'auth' | 'product' | 'reservation' | 'setting' | 'ai' | 'security';
  details?: string;
  status: 'success' | 'warning' | 'failed';
  ipAddress?: string;
}

export interface LoginAttemptRecord {
  ip: string;
  attemptsCount: number;
  lastFailedAt: string;
  isLockedUntil?: string;
}

export interface AiGovernanceAction {
  id: string;
  entityType: 'product' | 'category' | 'description' | 'price' | 'tag';
  entityId: string;
  entityTitle: string;
  suggestedChanges: Record<string, any>;
  reasoning: string;
  suggestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
}
