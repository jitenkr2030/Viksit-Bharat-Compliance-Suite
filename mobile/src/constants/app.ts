// App Configuration
export const APP_CONFIG = {
  // App Info
  name: 'Viksit Bharat Compliance Suite',
  version: '1.0.0',
  buildNumber: '1',
  bundleId: 'com.viksitbharat.compliance',
  environment: __DEV__ ? 'development' : 'production',
  
  // API Configuration
  api: {
    baseUrl: __DEV__ 
      ? 'http://localhost:5000/api' 
      : 'https://api.viksitbharat.com/api',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  
  // Authentication
  auth: {
    tokenKey: 'viksit_bharat_token',
    refreshTokenKey: 'viksit_bharat_refresh_token',
    userKey: 'viksit_bharat_user',
    biometricKey: 'viksit_bharat_biometric',
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    rememberMeExpiry: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
  
  // Storage Keys
  storage: {
    user: 'vb_user',
    settings: 'vb_settings',
    notifications: 'vb_notifications',
    offlineData: 'vb_offline_data',
    appState: 'vb_app_state',
    lastSync: 'vb_last_sync',
  },
  
  // Network Configuration
  network: {
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
    offlineRetryDelay: 5000,
    pingInterval: 30000, // 30 seconds
  },
  
  // Offline Configuration
  offline: {
    enabled: true,
    syncInterval: 5 * 60 * 1000, // 5 minutes
    maxOfflineDays: 7,
    enableBackgroundSync: true,
    prioritySyncInterval: 60000, // 1 minute
  },
  
  // Push Notifications
  notifications: {
    enabled: true,
    channels: {
      compliance: 'compliance_alerts',
      deadlines: 'deadline_reminders',
      general: 'general_notifications',
      urgent: 'urgent_notifications',
    },
    icon: 'ic_notification',
    sound: 'default',
    vibration: true,
    badge: true,
    importance: 'high' as const,
  },
  
  // Biometric Authentication
  biometric: {
    enabled: true,
    allowFallback: true,
    timeout: 30000,
    fallbackToPasscode: true,
    fallbackMessage: 'Use passcode to authenticate',
  },
  
  // UI Configuration
  ui: {
    animationDuration: 300,
    cardBorderRadius: 12,
    buttonBorderRadius: 8,
    inputBorderRadius: 8,
    tabBarHeight: 60,
    headerHeight: 56,
    statusBarHeight: 24,
    drawerWidth: 280,
    modalBorderRadius: 16,
    loadingSpinnerSize: 40,
  },
  
  // Feature Flags
  features: {
    offlineMode: true,
    biometricAuth: true,
    pushNotifications: true,
    darkMode: true,
    analytics: !__DEV__,
    crashReporting: !__DEV__,
    performanceMonitoring: !__DEV__,
    a11yMode: true,
    hapticFeedback: true,
    voiceCommands: false,
    camera: true,
    documentScanner: true,
    qrCode: true,
    print: true,
    share: true,
    location: false,
    calendar: true,
    contacts: false,
  },
  
  // Data Limits
  limits: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxImageSize: 5 * 1024 * 1024, // 5MB
    maxVideoSize: 50 * 1024 * 1024, // 50MB
    maxOfflineRecords: 1000,
    maxCachedImages: 100,
    maxSearchHistory: 50,
    maxRecentDocuments: 20,
  },
  
  // Validation Rules
  validation: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    password: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
    },
    phone: /^[+]?[1-9]\d{1,14}$/,
    pincode: /^\d{6}$/,
    aadhar: /^\d{12}$/,
  },
  
  // Error Codes
  errors: {
    NETWORK_ERROR: 'NETWORK_ERROR',
    AUTH_ERROR: 'AUTH_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    SERVER_ERROR: 'SERVER_ERROR',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    OFFLINE_ERROR: 'OFFLINE_ERROR',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR',
    BIOMETRIC_ERROR: 'BIOMETRIC_ERROR',
    STORAGE_ERROR: 'STORAGE_ERROR',
  },
  
  // Success Messages
  messages: {
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logged out successfully',
    DATA_SAVED: 'Data saved successfully',
    DATA_UPDATED: 'Data updated successfully',
    DATA_DELETED: 'Data deleted successfully',
    UPLOAD_SUCCESS: 'File uploaded successfully',
    DOWNLOAD_SUCCESS: 'File downloaded successfully',
    SYNC_SUCCESS: 'Data synchronized successfully',
    PROFILE_UPDATED: 'Profile updated successfully',
    PASSWORD_CHANGED: 'Password changed successfully',
  },
  
  // Council Information
  councils: {
    regulatory: {
      name: 'Viniyaman Parishad',
      shortName: 'Regulatory',
      color: '#3B82F6',
      icon: 'scale',
      description: 'Regulatory compliance and oversight',
    },
    standards: {
      name: 'Manak Parishad',
      shortName: 'Standards',
      color: '#8B5CF6',
      icon: 'target',
      description: 'Educational standards and quality assurance',
    },
    accreditation: {
      name: 'Gunvatta Parishad',
      shortName: 'Accreditation',
      color: '#F59E0B',
      icon: 'award',
      description: 'Institutional accreditation and certification',
    },
  },
  
  // Compliance Status
  complianceStatus: {
    compliant: {
      label: 'Compliant',
      color: '#10B981',
      icon: 'check-circle',
    },
    needsImprovement: {
      label: 'Needs Improvement',
      color: '#F59E0B',
      icon: 'alert-circle',
    },
    nonCompliant: {
      label: 'Non-Compliant',
      color: '#EF4444',
      icon: 'x-circle',
    },
    pending: {
      label: 'Pending Review',
      color: '#6B7280',
      icon: 'clock',
    },
    expired: {
      label: 'Expired',
      color: '#DC2626',
      icon: 'calendar-x',
    },
  },
  
  // Document Types
  documentTypes: {
    accreditation: {
      label: 'Accreditation',
      color: '#F59E0B',
      icon: 'award',
    },
    compliance: {
      label: 'Compliance',
      color: '#10B981',
      icon: 'shield-check',
    },
    faculty: {
      label: 'Faculty',
      color: '#8B5CF6',
      icon: 'users',
    },
    infrastructure: {
      label: 'Infrastructure',
      color: '#3B82F6',
      icon: 'building',
    },
    regulatory: {
      label: 'Regulatory',
      color: '#EF4444',
      icon: 'scale',
    },
  },
  
  // User Roles
  roles: {
    admin: {
      label: 'Administrator',
      color: '#DC2626',
      icon: 'shield-check',
      permissions: ['all'],
    },
    regulatory_officer: {
      label: 'Regulatory Officer',
      color: '#3B82F6',
      icon: 'scale',
      permissions: ['regulatory', 'approvals', 'compliance'],
    },
    standards_officer: {
      label: 'Standards Officer',
      color: '#8B5CF6',
      icon: 'target',
      permissions: ['standards', 'faculty', 'curriculum'],
    },
    accreditation_officer: {
      label: 'Accreditation Officer',
      color: '#F59E0B',
      icon: 'award',
      permissions: ['accreditation', 'certification', 'audit'],
    },
    institution_admin: {
      label: 'Institution Admin',
      color: '#10B981',
      icon: 'building',
      permissions: ['institution', 'faculty', 'documents'],
    },
    faculty: {
      label: 'Faculty',
      color: '#6B7280',
      icon: 'user',
      permissions: ['profile', 'documents'],
    },
  },
  
  // Sync Configuration
  sync: {
    interval: 5 * 60 * 1000, // 5 minutes
    priorityInterval: 60 * 1000, // 1 minute
    batchSize: 50,
    maxRetries: 3,
    retryDelay: 2000,
    conflictResolution: 'server-wins',
  },
  
  // Analytics
  analytics: {
    enabled: !__DEV__,
    trackingId: __DEV__ ? '' : 'GA_TRACKING_ID',
    events: {
      APP_OPENED: 'app_opened',
      LOGIN: 'login',
      LOGOUT: 'logout',
      DOCUMENT_UPLOAD: 'document_upload',
      REPORT_GENERATED: 'report_generated',
      COMPLIANCE_CHECK: 'compliance_check',
    },
  },
  
  // Crash Reporting
  crashReporting: {
    enabled: !__DEV__,
    dsn: __DEV__ ? '' : 'SENTRY_DSN',
    environment: __DEV__ ? 'development' : 'production',
    sampleRate: 1.0,
  },
};

// Export default configuration
export default APP_CONFIG;