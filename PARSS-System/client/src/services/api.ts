import axios, { AxiosResponse, AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  TokenRefreshResponse,
  User,
  ChangePasswordData,
  ForgotPasswordData,
  ResetPasswordData,
  ApiError
} from '@/types/auth';

// Create axios instance
const api = axios.create({
  baseURL: process.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as any;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await authAPI.refreshToken(refreshToken);
          const { access_token, refresh_token } = response.tokens;
          
          // Store new tokens
          localStorage.setItem('authToken', access_token);
          localStorage.setItem('refreshToken', refresh_token);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const message = error.response?.data?.message || 'An error occurred';
    const isAuthEndpoint = originalRequest.url?.includes('/auth/');
    
    // Don't show toast for auth endpoints during login/register
    if (!isAuthEndpoint) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

// API response wrapper
class ApiResponse<T = any> {
  constructor(
    public success: boolean,
    public data?: T,
    public error?: string,
    public message?: string
  ) {}

  static success<T>(data: T, message?: string): ApiResponse<T> {
    return new ApiResponse(true, data, undefined, message);
  }

  static error(error: string): ApiResponse {
    return new ApiResponse(false, undefined, error);
  }
}

// Auth API
export const authAPI = {
  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  // Register
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  // Get current user
  getCurrentUser: async (): Promise<{ user: User }> => {
    const response = await api.get<{ user: User }>('/auth/me');
    return response.data;
  },

  // Validate token
  validateToken: async (): Promise<{ user: User } | null> => {
    try {
      const response = await api.get<{ user: User }>('/auth/me');
      return response.data;
    } catch (error) {
      return null;
    }
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<TokenRefreshResponse> => {
    const response = await api.post<TokenRefreshResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  // Update profile
  updateProfile: async (data: Partial<User>): Promise<{ user: User }> => {
    const response = await api.put<{ user: User }>('/auth/profile', data);
    return response.data;
  },

  // Change password
  changePassword: async (data: ChangePasswordData): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>('/auth/change-password', data);
    return response.data;
  },

  // Forgot password
  forgotPassword: async (data: ForgotPasswordData): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/forgot-password', data);
    return response.data;
  },

  // Reset password
  resetPassword: async (data: ResetPasswordData): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/reset-password', data);
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  // Get dashboard overview
  getOverview: async () => {
    const response = await api.get('/dashboard/overview');
    return response.data;
  },

  // Get compliance statistics
  getStatistics: async () => {
    const response = await api.get('/dashboard/statistics');
    return response.data;
  },

  // Get risk assessment
  getRiskAssessment: async () => {
    const response = await api.get('/dashboard/risk-assessment');
    return response.data;
  },

  // Get recent activities
  getActivities: async () => {
    const response = await api.get('/dashboard/activities');
    return response.data;
  },
};

// Regulatory API
export const regulatoryAPI = {
  // Get regulatory overview
  getOverview: async () => {
    const response = await api.get('/regulatory/overview');
    return response.data;
  },

  // Get approvals
  getApprovals: async (params?: {
    status?: string;
    approval_type?: string;
    priority_level?: string;
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }) => {
    const response = await api.get('/regulatory/approvals', { params });
    return response.data;
  },

  // Get single approval
  getApproval: async (id: string) => {
    const response = await api.get(`/regulatory/approvals/${id}`);
    return response.data;
  },

  // Create approval
  createApproval: async (data: any) => {
    const response = await api.post('/regulatory/approvals', data);
    return response.data;
  },

  // Update approval
  updateApproval: async (id: string, data: any) => {
    const response = await api.patch(`/regulatory/approvals/${id}`, data);
    return response.data;
  },

  // Delete approval
  deleteApproval: async (id: string) => {
    const response = await api.delete(`/regulatory/approvals/${id}`);
    return response.data;
  },

  // Get expiring approvals
  getExpiringApprovals: async (days?: number) => {
    const response = await api.get('/regulatory/approvals/expiring', {
      params: { days },
    });
    return response.data;
  },

  // Get expired approvals
  getExpiredApprovals: async () => {
    const response = await api.get('/regulatory/approvals/expired');
    return response.data;
  },

  // Get statistics
  getStatistics: async () => {
    const response = await api.get('/regulatory/statistics');
    return response.data;
  },

  // Bulk operations
  bulkUpdate: async (data: {
    approval_ids: string[];
    action: string;
    data: any;
  }) => {
    const response = await api.patch('/regulatory/approvals/bulk', data);
    return response.data;
  },
};

// Standards API
export const standardsAPI = {
  getComplianceScores: async (params?: { institutionId?: string; category?: string; search?: string }) => {
    const response = await api.get('/standards/compliance-scores', { params });
    return response.data;
  },

  getFacultyAssessment: async (params?: { institutionId?: string; department?: string }) => {
    const response = await api.get('/standards/faculty-assessment', { params });
    return response.data;
  },

  getBenchmarks: async (params?: { category?: string; level?: string }) => {
    const response = await api.get('/standards/benchmarks', { params });
    return response.data;
  },

  updateComplianceScore: async (id: string, data: any) => {
    const response = await api.put(`/standards/compliance-scores/${id}`, data);
    return response.data;
  },

  getAnalytics: async (params?: { period?: string; institutionId?: string }) => {
    const response = await api.get('/standards/analytics', { params });
    return response.data;
  },

  generateReport: async (data: { institutionId: string; reportType: string; period?: string }) => {
    const response = await api.post('/standards/reports/generate', data);
    return response.data;
  },

  scheduleAudit: async (data: { institutionId: string; auditDate: string; auditType: string; auditors: string[] }) => {
    const response = await api.post('/standards/audits/schedule', data);
    return response.data;
  },
};

// Accreditation API
export const accreditationAPI = {
  getStatus: async (params?: { institutionId?: string; level?: string; status?: string }) => {
    const response = await api.get('/accreditation/status', { params });
    return response.data;
  },

  getApplications: async (params?: { status?: string; institutionId?: string; page?: number; limit?: number }) => {
    const response = await api.get('/accreditation/applications', { params });
    return response.data;
  },

  updateStatus: async (id: string, data: any) => {
    const response = await api.put(`/accreditation/status/${id}`, data);
    return response.data;
  },

  initiate: async (data: { institutionId: string; applicationType: string; targetLevel: string; expectedDuration: number }) => {
    const response = await api.post('/accreditation/initiate', data);
    return response.data;
  },

  getAnalytics: async (params?: { period?: string }) => {
    const response = await api.get('/accreditation/analytics', { params });
    return response.data;
  },

  generateCertificate: async (data: { accreditationId: string; certificateType: string }) => {
    const response = await api.post('/accreditation/certificates/generate', data);
    return response.data;
  },

  reviewApplication: async (id: string, data: { status: string; comments: string; reviewerNotes?: string }) => {
    const response = await api.post(`/accreditation/applications/${id}/review`, data);
    return response.data;
  },
};

// Alerts API
export const alertsAPI = {
  getAlerts: async (params?: { status?: string; type?: string; priority?: string; page?: number; limit?: number }) => {
    const response = await api.get('/alerts', { params });
    return response.data;
  },

  createAlert: async (data: {
    title: string;
    message: string;
    type: string;
    priority: string;
    category: string;
    targetUsers?: string[];
    targetInstitutions?: string[];
    actionUrl?: string;
    expiresAt?: string;
  }) => {
    const response = await api.post('/alerts', data);
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.patch(`/alerts/${id}/read`);
    return response.data;
  },

  markMultipleAsRead: async (alertIds: string[]) => {
    const response = await api.patch('/alerts/read-multiple', { alertIds });
    return response.data;
  },

  dismissAlert: async (id: string, reason?: string) => {
    const response = await api.patch(`/alerts/${id}/dismiss`, { reason });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/alerts/stats');
    return response.data;
  },

  deleteAlert: async (id: string) => {
    const response = await api.delete(`/alerts/${id}`);
    return response.data;
  },

  bulkAction: async (data: { action: string; alertIds: string[]; reason?: string }) => {
    const response = await api.post('/alerts/bulk-actions', data);
    return response.data;
  },
};

// Faculty API
export const facultyAPI = {
  getFaculty: async (params?: { institutionId?: string; department?: string; search?: string; complianceStatus?: string; page?: number; limit?: number }) => {
    const response = await api.get('/faculty', { params });
    return response.data;
  },

  getFacultyMember: async (id: string) => {
    const response = await api.get(`/faculty/${id}`);
    return response.data;
  },

  createFaculty: async (data: any) => {
    const response = await api.post('/faculty', data);
    return response.data;
  },

  updateFaculty: async (id: string, data: any) => {
    const response = await api.put(`/faculty/${id}`, data);
    return response.data;
  },

  updateCompliance: async (id: string, data: {
    complianceScore: number;
    complianceStatus: string;
    documents?: any;
    comments?: string;
  }) => {
    const response = await api.patch(`/faculty/${id}/compliance`, data);
    return response.data;
  },

  getComplianceReport: async (id: string, params?: { period?: string }) => {
    const response = await api.get(`/faculty/${id}/compliance-report`, { params });
    return response.data;
  },

  deleteFaculty: async (id: string, reason?: string) => {
    const response = await api.delete(`/faculty/${id}`, { data: { reason } });
    return response.data;
  },

  getStats: async (params?: { institutionId?: string }) => {
    const response = await api.get('/faculty/stats/overview', { params });
    return response.data;
  },
};

// Documents API
export const documentsAPI = {
  getDocuments: async (params?: { institutionId?: string; type?: string; category?: string; status?: string; search?: string; page?: number; limit?: number }) => {
    const response = await api.get('/documents', { params });
    return response.data;
  },

  getDocument: async (id: string) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  uploadDocument: async (data: {
    title: string;
    description?: string;
    type: string;
    category: string;
    institutionId: string;
    tags?: string;
    expiryDate?: string;
    file: File;
  }) => {
    const formData = new FormData();
    formData.append('document', data.file);
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    formData.append('type', data.type);
    formData.append('category', data.category);
    formData.append('institutionId', data.institutionId);
    if (data.tags) formData.append('tags', data.tags);
    if (data.expiryDate) formData.append('expiryDate', data.expiryDate);

    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateDocument: async (id: string, data: any) => {
    const response = await api.put(`/documents/${id}`, data);
    return response.data;
  },

  verifyDocument: async (id: string, data: { status: string; comments?: string }) => {
    const response = await api.patch(`/documents/${id}/verify`, data);
    return response.data;
  },

  downloadDocument: async (id: string) => {
    const response = await api.get(`/documents/${id}/download`);
    return response.data;
  },

  deleteDocument: async (id: string, reason?: string) => {
    const response = await api.delete(`/documents/${id}`, { data: { reason } });
    return response.data;
  },

  getStats: async (params?: { institutionId?: string; period?: string }) => {
    const response = await api.get('/documents/stats/overview', { params });
    return response.data;
  },
};

// Institutions API
export const institutionsAPI = {
  getInstitutions: async (params?: { search?: string; type?: string; category?: string; status?: string; page?: number; limit?: number }) => {
    const response = await api.get('/institutions', { params });
    return response.data;
  },

  getInstitution: async (id: string) => {
    const response = await api.get(`/institutions/${id}`);
    return response.data;
  },

  createInstitution: async (data: any) => {
    const response = await api.post('/institutions', data);
    return response.data;
  },

  updateInstitution: async (id: string, data: any) => {
    const response = await api.put(`/institutions/${id}`, data);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/institutions/stats/overview');
    return response.data;
  },
};

// Reports API
export const reportsAPI = {
  getReports: async (params?: { type?: string; status?: string; institutionId?: string; page?: number; limit?: number }) => {
    const response = await api.get('/reports', { params });
    return response.data;
  },

  generateReport: async (data: {
    type: string;
    title: string;
    period: string;
    institutionId?: string;
    parameters?: any;
  }) => {
    const response = await api.post('/reports/generate', data);
    return response.data;
  },

  getReport: async (id: string) => {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },

  downloadReport: async (id: string) => {
    const response = await api.get(`/reports/${id}/download`);
    return response.data;
  },

  deleteReport: async (id: string) => {
    const response = await api.delete(`/reports/${id}`);
    return response.data;
  },

  getTemplates: async () => {
    const response = await api.get('/reports/templates/available');
    return response.data;
  },
};

// Notifications API
export const notificationsAPI = {
  getNotifications: async (params?: { status?: string; type?: string; page?: number; limit?: number }) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },

  deleteNotification: async (id: string) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
};

// Enhanced API Service with all endpoints
export const apiService = {
  // Generic HTTP methods
  get: async <T>(url: string, params?: any): Promise<T> => {
    const response = await api.get<T>(url, { params });
    return response.data;
  },

  post: async <T>(url: string, data?: any): Promise<T> => {
    const response = await api.post<T>(url, data);
    return response.data;
  },

  put: async <T>(url: string, data?: any): Promise<T> => {
    const response = await api.put<T>(url, data);
    return response.data;
  },

  patch: async <T>(url: string, data?: any): Promise<T> => {
    const response = await api.patch<T>(url, data);
    return response.data;
  },

  delete: async <T>(url: string): Promise<T> => {
    const response = await api.delete<T>(url);
    return response.data;
  },

  // File upload with progress
  upload: async <T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  },

  // File download
  download: async (url: string, filename?: string): Promise<void> => {
    const response = await api.get(url, {
      responseType: 'blob',
    });

    // Create blob link to download
    const blob = new Blob([response.data]);
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename || 'download';
    link.click();
    window.URL.revokeObjectURL(link.href);
  },

  // Dashboard
  getDashboardOverview: () => dashboardAPI.getOverview(),
  getDashboardStatistics: () => dashboardAPI.getStatistics(),
  getRiskAssessment: () => dashboardAPI.getRiskAssessment(),
  getActivities: () => dashboardAPI.getActivities(),

  // Regulatory
  getRegulatoryOverview: () => regulatoryAPI.getOverview(),
  getApprovals: (params?: any) => regulatoryAPI.getApprovals(params),
  getApproval: (id: string) => regulatoryAPI.getApproval(id),
  createApproval: (data: any) => regulatoryAPI.createApproval(data),
  updateApproval: (id: string, data: any) => regulatoryAPI.updateApproval(id, data),
  deleteApproval: (id: string) => regulatoryAPI.deleteApproval(id),
  getRegulatoryStatistics: () => regulatoryAPI.getStatistics(),

  // Standards
  getComplianceScores: (params?: any) => standardsAPI.getComplianceScores(params),
  getFacultyAssessment: (params?: any) => standardsAPI.getFacultyAssessment(params),
  getBenchmarks: (params?: any) => standardsAPI.getBenchmarks(params),
  updateComplianceScore: (id: string, data: any) => standardsAPI.updateComplianceScore(id, data),
  getStandardsAnalytics: (params?: any) => standardsAPI.getAnalytics(params),
  generateStandardsReport: (data: any) => standardsAPI.generateReport(data),
  scheduleStandardsAudit: (data: any) => standardsAPI.scheduleAudit(data),

  // Accreditation
  getAccreditationStatus: (params?: any) => accreditationAPI.getStatus(params),
  getAccreditationApplications: (params?: any) => accreditationAPI.getApplications(params),
  updateAccreditationStatus: (id: string, data: any) => accreditationAPI.updateStatus(id, data),
  initiateAccreditation: (data: any) => accreditationAPI.initiate(data),
  getAccreditationAnalytics: (params?: any) => accreditationAPI.getAnalytics(params),
  generateAccreditationCertificate: (data: any) => accreditationAPI.generateCertificate(data),
  reviewAccreditationApplication: (id: string, data: any) => accreditationAPI.reviewApplication(id, data),

  // Alerts
  getAlerts: (params?: any) => alertsAPI.getAlerts(params),
  createAlert: (data: any) => alertsAPI.createAlert(data),
  markAlertAsRead: (id: string) => alertsAPI.markAsRead(id),
  markAlertsAsRead: (alertIds: string[]) => alertsAPI.markMultipleAsRead(alertIds),
  dismissAlert: (id: string, reason?: string) => alertsAPI.dismissAlert(id, reason),
  getAlertsStats: () => alertsAPI.getStats(),
  deleteAlert: (id: string) => alertsAPI.deleteAlert(id),
  performBulkAlertAction: (data: any) => alertsAPI.bulkAction(data),

  // Faculty
  getFaculty: (params?: any) => facultyAPI.getFaculty(params),
  getFacultyMember: (id: string) => facultyAPI.getFacultyMember(id),
  createFaculty: (data: any) => facultyAPI.createFaculty(data),
  updateFaculty: (id: string, data: any) => facultyAPI.updateFaculty(id, data),
  updateFacultyCompliance: (id: string, data: any) => facultyAPI.updateCompliance(id, data),
  getFacultyComplianceReport: (id: string, params?: any) => facultyAPI.getComplianceReport(id, params),
  deleteFaculty: (id: string, reason?: string) => facultyAPI.deleteFaculty(id, reason),
  getFacultyStats: (params?: any) => facultyAPI.getStats(params),

  // Documents
  getDocuments: (params?: any) => documentsAPI.getDocuments(params),
  getDocument: (id: string) => documentsAPI.getDocument(id),
  uploadDocument: (data: any) => documentsAPI.uploadDocument(data),
  updateDocument: (id: string, data: any) => documentsAPI.updateDocument(id, data),
  verifyDocument: (id: string, data: any) => documentsAPI.verifyDocument(id, data),
  downloadDocument: (id: string) => documentsAPI.downloadDocument(id),
  deleteDocument: (id: string, reason?: string) => documentsAPI.deleteDocument(id, reason),
  getDocumentsStats: (params?: any) => documentsAPI.getStats(params),

  // Institutions
  getInstitutions: (params?: any) => institutionsAPI.getInstitutions(params),
  getInstitution: (id: string) => institutionsAPI.getInstitution(id),
  createInstitution: (data: any) => institutionsAPI.createInstitution(data),
  updateInstitution: (id: string, data: any) => institutionsAPI.updateInstitution(id, data),
  getInstitutionsStats: () => institutionsAPI.getStats(),

  // Reports
  getReports: (params?: any) => reportsAPI.getReports(params),
  generateReport: (data: any) => reportsAPI.generateReport(data),
  getReport: (id: string) => reportsAPI.getReport(id),
  downloadReport: (id: string) => reportsAPI.downloadReport(id),
  deleteReport: (id: string) => reportsAPI.deleteReport(id),
  getReportTemplates: () => reportsAPI.getTemplates(),

  // Notifications
  getNotifications: (params?: any) => notificationsAPI.getNotifications(params),
  markNotificationAsRead: (id: string) => notificationsAPI.markAsRead(id),
  markAllNotificationsAsRead: () => notificationsAPI.markAllAsRead(),
  deleteNotification: (id: string) => notificationsAPI.deleteNotification(id),
};

// Error handler
export const handleApiError = (error: AxiosError<ApiError>): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

// Export the axios instance for custom requests
export { api };

export default apiService;