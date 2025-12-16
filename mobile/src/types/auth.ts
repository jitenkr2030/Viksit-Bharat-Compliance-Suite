// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  permissions: string[];
  institutions: string[];
  department?: string;
  bio?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 
  | 'admin'
  | 'super_admin'
  | 'regulatory_officer'
  | 'standards_officer'
  | 'accreditation_officer'
  | 'compliance_officer'
  | 'institution_admin'
  | 'faculty'
  | 'student';

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  biometricEnabled?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  institutionId?: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
  message?: string;
}

export interface TokenRefreshResponse {
  tokens: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

// API Error Types
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
  timestamp?: string;
}

// Authentication State Types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  forgotPassword: (data: ForgotPasswordData) => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  clearError: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole) => boolean;
}

// Biometric Authentication Types
export interface BiometricConfig {
  enabled: boolean;
  type: 'face' | 'fingerprint' | 'both';
  fallbackEnabled: boolean;
}

export interface BiometricResult {
  success: boolean;
  error?: string;
  biometricType?: string;
}

// Session Types
export interface Session {
  id: string;
  userId: string;
  deviceId: string;
  deviceName: string;
  platform: string;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
}

// Authentication Events
export type AuthEvent = 
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; tokens: any } }
  | { type: 'LOGIN_FAILURE'; payload: { error: string } }
  | { type: 'LOGOUT' }
  | { type: 'TOKEN_REFRESHED'; payload: { tokens: any } }
  | { type: 'TOKEN_EXPIRED' }
  | { type: 'PROFILE_UPDATED'; payload: { user: User } }
  | { type: 'PASSWORD_CHANGED' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'AUTH_ERROR'; payload: { error: string } };