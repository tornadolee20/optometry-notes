// 認證和授權相關類型定義

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin', 
  MANAGER = 'manager',
  USER = 'user'
}

export enum Permission {
  // 系統管理
  SYSTEM_READ = 'system:read',
  SYSTEM_WRITE = 'system:write',
  SYSTEM_DELETE = 'system:delete',
  
  // 用戶管理
  USERS_READ = 'users:read',
  USERS_WRITE = 'users:write', 
  USERS_DELETE = 'users:delete',
  
  // 店家管理
  STORES_READ = 'stores:read',
  STORES_WRITE = 'stores:write',
  STORES_DELETE = 'stores:delete',
  
  // 訂閱管理
  SUBSCRIPTIONS_READ = 'subscriptions:read',
  SUBSCRIPTIONS_WRITE = 'subscriptions:write',
  SUBSCRIPTIONS_DELETE = 'subscriptions:delete',
  
  // 財務管理
  FINANCE_READ = 'finance:read',
  FINANCE_WRITE = 'finance:write',
  
  // 日誌查看
  LOGS_READ = 'logs:read',
  LOGS_EXPORT = 'logs:export',
  
  // 分析報告
  ANALYTICS_READ = 'analytics:read',
  ANALYTICS_EXPORT = 'analytics:export',
  
  // 設定管理
  SETTINGS_READ = 'settings:read',
  SETTINGS_WRITE = 'settings:write'
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  is_active: boolean;
  is_verified: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
  profile?: UserProfile;
  sessions?: UserSession[];
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  timezone?: string;
  language?: string;
  created_at: string;
  updated_at: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  refresh_token?: string;
  device_info?: DeviceInfo;
  ip_address?: string;
  location?: string;
  is_active: boolean;
  expires_at: string;
  created_at: string;
  last_activity_at: string;
}

export interface DeviceInfo {
  user_agent: string;
  device_type: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  screen_resolution?: string;
}

export interface AuthContext {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: Permission[];
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<boolean>;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  requiresMFA?: boolean;
  mfaToken?: string;
}

export interface MFASetup {
  secret: string;
  qr_code: string;
  backup_codes: string[];
}

export interface LoginAttempt {
  id: string;
  email: string;
  ip_address: string;
  user_agent: string;
  success: boolean;
  failure_reason?: string;
  created_at: string;
}

// 角色權限映射
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: Object.values(Permission),
  [UserRole.ADMIN]: [
    Permission.SYSTEM_READ,
    Permission.USERS_READ,
    Permission.USERS_WRITE,
    Permission.STORES_READ,
    Permission.STORES_WRITE,
    Permission.STORES_DELETE,
    Permission.SUBSCRIPTIONS_READ,
    Permission.SUBSCRIPTIONS_WRITE,
    Permission.FINANCE_READ,
    Permission.LOGS_READ,
    Permission.ANALYTICS_READ,
    Permission.ANALYTICS_EXPORT,
    Permission.SETTINGS_READ,
    Permission.SETTINGS_WRITE
  ],
  [UserRole.MANAGER]: [
    Permission.STORES_READ,
    Permission.STORES_WRITE,
    Permission.SUBSCRIPTIONS_READ,
    Permission.ANALYTICS_READ,
    Permission.LOGS_READ
  ],
  [UserRole.USER]: [
    Permission.STORES_READ
  ]
};

export default {
  UserRole,
  Permission,
  ROLE_PERMISSIONS
};