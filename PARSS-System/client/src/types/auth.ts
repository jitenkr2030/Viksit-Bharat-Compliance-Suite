// User types
export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: UserRole;
  institution_id?: string;
  institution?: Institution;
  department?: string;
  position?: string;
  phone?: string;
  profile_image?: string;
  permissions?: Record<string, boolean>;
  preferences?: UserPreferences;
  compliance_scope?: ComplianceScope;
  last_login_at?: string;
  login_count?: number;
  is_verified?: boolean;
  two_factor_enabled?: boolean;
  created_at?: string;
  updated_at?: string;
}

export type UserRole = 
  | 'system_admin'
  | 'super_admin'
  | 'admin'
  | 'compliance_officer'
  | 'principal'
  | 'vice_principal'
  | 'department_head'
  | 'faculty'
  | 'auditor'
  | 'viewer'
  | 'support_staff';

export interface Institution {
  id: string;
  name: string;
  code: string;
  type: 'school' | 'college' | 'university' | 'institute';
  level: 'primary' | 'secondary' | 'higher_secondary' | 'undergraduate' | 'postgraduate' | 'research';
  board?: string;
  address?: Address;
  contact?: Contact;
  principal_name: string;
  principal_email: string;
  principal_phone: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  created_at?: string;
  updated_at?: string;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

export interface Contact {
  phone?: string;
  email?: string;
  website?: string;
  fax?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    in_app: boolean;
  };
  dashboard: {
    default_view: string;
    widgets: string[];
  };
}

export interface ComplianceScope {
  councils: string[];
  departments: string[];
  can_view_all_institutions: boolean;
  can_manage_faculty: boolean;
  can_manage_approvals: boolean;
  can_generate_reports: boolean;
  can_manage_alerts: boolean;
}

// Auth request/response types
export interface LoginCredentials {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  institution_id?: string;
  department?: string;
  position?: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    access_token: string;
    refresh_token: string;
    expires_in: string;
  };
}

export interface TokenRefreshResponse {
  tokens: {
    access_token: string;
    refresh_token: string;
    expires_in: string;
  };
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

// API Error types
export interface ApiError {
  error: string;
  message: string;
  details?: Array<{
    field: string;
    message: string;
    value: any;
  }>;
  code?: string;
}

// Auth state
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Permission types
export type Permission = 
  | 'view_dashboard'
  | 'manage_approvals'
  | 'manage_alerts'
  | 'generate_reports'
  | 'manage_documents'
  | 'view_faculty'
  | 'view_own_data'
  | 'update_profile'
  | 'upload_documents'
  | 'view_all_data'
  | 'audit_compliance'
  | 'view_regulatory'
  | 'view_standards'
  | 'view_accreditation'
  | 'manage_curriculum'
  | 'manage_accreditation'
  | 'manage_audits'
  | 'manage_notifications';

// Validation types
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Session types
export interface Session {
  id: string;
  user_id: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
}

// Two-factor authentication types
export interface TwoFactorSetup {
  secret: string;
  qr_code: string;
  backup_codes: string[];
}

export interface TwoFactorVerify {
  token: string;
}

// Audit log types
export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

// Password reset types
export interface PasswordResetToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  used_at?: string;
  created_at: string;
}

// Email verification types
export interface EmailVerificationToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  verified_at?: string;
  created_at: string;
}