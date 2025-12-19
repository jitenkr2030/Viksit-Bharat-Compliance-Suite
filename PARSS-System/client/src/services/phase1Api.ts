import { api } from '@/services/api';
import type {
  ComplianceDeadline,
  RiskAssessment,
  AlertNotification,
  RiskDashboardWidget,
  NotificationSummary,
  DeadlineSummary,
  RiskSummary,
  DeadlineFilters,
  RiskAssessmentFilters,
  NotificationFilters,
  CreateDeadlineForm,
  UpdateDeadlineForm,
  CreateRiskAssessmentForm,
  SendNotificationForm,
  ComplianceDeadlinesResponse,
  RiskAssessmentResponse,
  AlertNotificationsResponse
} from '@/types/phase1';

class Phase1API {
  // Compliance Deadlines
  async getDeadlines(filters?: DeadlineFilters, page = 1, limit = 20) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    
    const response = await api.get<ComplianceDeadlinesResponse>(`/critical-alerts/deadlines?${params}`);
    return response.data;
  }

  async getDeadline(id: string) {
    const response = await api.get(`/critical-alerts/deadlines/${id}`);
    return response.data;
  }

  async createDeadline(data: CreateDeadlineForm) {
    const response = await api.post('/critical-alerts/deadlines', data);
    return response.data;
  }

  async updateDeadline(id: string, data: UpdateDeadlineForm) {
    const response = await api.put(`/critical-alerts/deadlines/${id}`, data);
    return response.data;
  }

  async deleteDeadline(id: string) {
    const response = await api.delete(`/critical-alerts/deadlines/${id}`);
    return response.data;
  }

  async getUpcomingDeadlines(days = 30) {
    const response = await api.get(`/critical-alerts/deadlines/upcoming?days=${days}`);
    return response.data;
  }

  async getOverdueDeadlines() {
    const response = await api.get('/critical-alerts/deadlines/overdue');
    return response.data;
  }

  async getHighRiskDeadlines(minRiskScore = 70) {
    const response = await api.get(`/critical-alerts/deadlines/high-risk?minScore=${minRiskScore}`);
    return response.data;
  }

  async completeDeadline(id: string, completionData: {
    completionPercentage: number;
    submittedDocuments?: string[];
    notes?: string;
  }) {
    const response = await api.put(`/critical-alerts/deadlines/${id}/complete`, completionData);
    return response.data;
  }

  // Risk Assessments
  async getRiskAssessments(filters?: RiskAssessmentFilters, page = 1, limit = 20) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    
    const response = await api.get(`/critical-alerts/risk-assessments?${params}`);
    return response.data;
  }

  async getRiskAssessment(id: string) {
    const response = await api.get(`/critical-alerts/risk-assessments/${id}`);
    return response.data;
  }

  async createRiskAssessment(data: CreateRiskAssessmentForm) {
    const response = await api.post('/critical-alerts/risk-assessments', data);
    return response.data;
  }

  async updateRiskAssessment(id: string, data: Partial<CreateRiskAssessmentForm>) {
    const response = await api.put(`/critical-alerts/risk-assessments/${id}`, data);
    return response.data;
  }

  async deleteRiskAssessment(id: string) {
    const response = await api.delete(`/critical-alerts/risk-assessments/${id}`);
    return response.data;
  }

  async getHighRiskAssessments(minRiskScore = 70) {
    const response = await api.get(`/critical-alerts/risk-assessments/high-risk?minScore=${minRiskScore}`);
    return response.data;
  }

  async getRecentRiskAssessments(days = 7) {
    const response = await api.get(`/critical-alerts/risk-assessments/recent?days=${days}`);
    return response.data;
  }

  async getRiskAssessmentsNeedingUpdate() {
    const response = await api.get('/critical-alerts/risk-assessments/needing-update');
    return response.data;
  }

  async runRiskAssessment(deadlineId: string) {
    const response = await api.post(`/critical-alerts/risk-assessments/run/${deadlineId}`);
    return response.data;
  }

  // Alert Notifications
  async getNotifications(filters?: NotificationFilters, page = 1, limit = 20) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    
    const response = await api.get(`/critical-alerts/notifications?${params}`);
    return response.data;
  }

  async getNotification(id: string) {
    const response = await api.get(`/critical-alerts/notifications/${id}`);
    return response.data;
  }

  async sendNotification(data: SendNotificationForm) {
    const response = await api.post('/critical-alerts/notifications/send', data);
    return response.data;
  }

  async resendNotification(id: string) {
    const response = await api.post(`/critical-alerts/notifications/${id}/resend`);
    return response.data;
  }

  async acknowledgeNotification(id: string, acknowledgmentResponse?: string) {
    const response = await api.post(`/critical-alerts/notifications/${id}/acknowledge`, { response: acknowledgmentResponse });
    return response.data;
  }

  async getPendingNotifications() {
    const response = await api.get('/critical-alerts/notifications/pending');
    return response.data;
  }

  async getFailedNotifications() {
    const response = await api.get('/critical-alerts/notifications/failed');
    return response.data;
  }

  async getNotificationsRequiringRetry() {
    const response = await api.get('/critical-alerts/notifications/retry');
    return response.data;
  }

  async getEscalationCandidates() {
    const response = await api.get('/critical-alerts/notifications/escalation-candidates');
    return response.data;
  }

  async escalateNotification(id: string) {
    const response = await api.post(`/critical-alerts/notifications/${id}/escalate`);
    return response.data;
  }

  // Dashboard and Analytics
  async getDashboardWidgets() {
    const response = await api.get<{ success: boolean; data: RiskDashboardWidget[] }>('/critical-alerts/dashboard/widgets');
    return response.data;
  }

  async getNotificationSummary() {
    const response = await api.get<{ success: boolean; data: NotificationSummary }>('/critical-alerts/dashboard/notifications');
    return response.data;
  }

  async getDeadlineSummary() {
    const response = await api.get<{ success: boolean; data: DeadlineSummary }>('/critical-alerts/dashboard/deadlines');
    return response.data;
  }

  async getRiskSummary() {
    const response = await api.get<{ success: boolean; data: RiskSummary }>('/critical-alerts/dashboard/risk');
    return response.data;
  }

  async getRiskTrends(days = 30) {
    const response = await api.get(`/critical-alerts/dashboard/trends?days=${days}`);
    return response.data;
  }

  async getComplianceMetrics() {
    const response = await api.get('/critical-alerts/dashboard/metrics');
    return response.data;
  }

  // Batch Operations
  async batchUpdateDeadlines(deadlineIds: string[], updates: Partial<ComplianceDeadline>) {
    const response = await api.put('/critical-alerts/deadlines/batch-update', {
      deadlineIds,
      updates
    });
    return response.data;
  }

  async batchSendNotifications(notificationData: SendNotificationForm[]) {
    const response = await api.post('/critical-alerts/notifications/batch-send', {
      notifications: notificationData
    });
    return response.data;
  }

  async batchRunRiskAssessments(deadlineIds: string[]) {
    const response = await api.post('/critical-alerts/risk-assessments/batch-run', {
      deadlineIds
    });
    return response.data;
  }

  // Templates and Configuration
  async getNotificationTemplates() {
    const response = await api.get('/critical-alerts/templates/notifications');
    return response.data;
  }

  async createNotificationTemplate(template: {
    name: string;
    description?: string;
    type: string;
    subject?: string;
    message: string;
    channels: string[];
    variables: string[];
  }) {
    const response = await api.post('/critical-alerts/templates/notifications', template);
    return response.data;
  }

  async updateNotificationTemplate(id: string, template: Partial<{
    name: string;
    description?: string;
    subject?: string;
    message: string;
    variables: string[];
  }>) {
    const response = await api.put(`/critical-alerts/templates/notifications/${id}`, template);
    return response.data;
  }

  async deleteNotificationTemplate(id: string) {
    const response = await api.delete(`/critical-alerts/templates/notifications/${id}`);
    return response.data;
  }

  async getNotificationSettings() {
    const response = await api.get('/critical-alerts/settings/notifications');
    return response.data;
  }

  async updateNotificationSettings(settings: {
    defaultChannels: string[];
    defaultFrequency: string;
    retryAttempts: number;
    retryDelay: number;
    escalationLevels: number;
    escalationDelay: number;
  }) {
    const response = await api.put('/critical-alerts/settings/notifications', settings);
    return response.data;
  }

  // Statistics and Reports
  async getComplianceStatistics(period = '30d') {
    const response = await api.get(`/critical-alerts/reports/statistics?period=${period}`);
    return response.data;
  }

  async getRiskReport(startDate: string, endDate: string) {
    const response = await api.get(`/critical-alerts/reports/risk?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  }

  async getNotificationReport(startDate: string, endDate: string) {
    const response = await api.get(`/critical-alerts/reports/notifications?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  }

  async exportDeadlines(format: 'csv' | 'xlsx' | 'pdf', filters?: DeadlineFilters) {
    const params = new URLSearchParams({
      format,
      ...filters
    });
    
    const response = await api.get(`/critical-alerts/export/deadlines?${params}`, {
      responseType: 'blob'
    });
    return response.data;
  }

  async exportRiskAssessments(format: 'csv' | 'xlsx' | 'pdf', filters?: RiskAssessmentFilters) {
    const params = new URLSearchParams({
      format,
      ...filters
    });
    
    const response = await api.get(`/critical-alerts/export/risk-assessments?${params}`, {
      responseType: 'blob'
    });
    return response.data;
  }

  async exportNotifications(format: 'csv' | 'xlsx' | 'pdf', filters?: NotificationFilters) {
    const params = new URLSearchParams({
      format,
      ...filters
    });
    
    const response = await api.get(`/critical-alerts/export/notifications?${params}`, {
      responseType: 'blob'
    });
    return response.data;
  }
}

export const phase1API = new Phase1API();