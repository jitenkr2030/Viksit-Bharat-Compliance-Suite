// Phase 4: Fully Autonomous Compliance Management - API Client

import axios from 'axios';
import {
  AutonomousSystem,
  AutonomousDecision,
  AutonomousTask,
  AutonomousOptimization,
  DecisionDependency,
  TaskDependency,
  OptimizationDependency
} from '@/types/autonomousSystem';

// Create axios instance with base configuration
const autonomousSystemApi = axios.create({
  baseURL: '/api/autonomous-system',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
autonomousSystemApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
autonomousSystemApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Autonomous System API

export const autonomousSystemApiClient = {
  // System Management
  getAllSystems: async (): Promise<AutonomousSystem[]> => {
    const response = await autonomousSystemApi.get('/systems');
    return response.data;
  },

  getSystemById: async (id: string): Promise<AutonomousSystem> => {
    const response = await autonomousSystemApi.get(`/systems/${id}`);
    return response.data;
  },

  createSystem: async (system: Partial<AutonomousSystem>): Promise<AutonomousSystem> => {
    const response = await autonomousSystemApi.post('/systems', system);
    return response.data;
  },

  updateSystem: async (id: string, system: Partial<AutonomousSystem>): Promise<AutonomousSystem> => {
    const response = await autonomousSystemApi.put(`/systems/${id}`, system);
    return response.data;
  },

  deleteSystem: async (id: string): Promise<void> => {
    await autonomousSystemApi.delete(`/systems/${id}`);
  },

  activateSystem: async (id: string): Promise<AutonomousSystem> => {
    const response = await autonomousSystemApi.post(`/systems/${id}/activate`);
    return response.data;
  },

  deactivateSystem: async (id: string): Promise<AutonomousSystem> => {
    const response = await autonomousSystemApi.post(`/systems/${id}/deactivate`);
    return response.data;
  },

  getSystemHealth: async (id: string): Promise<any> => {
    const response = await autonomousSystemApi.get(`/systems/${id}/health`);
    return response.data;
  },

  getSystemPerformance: async (id: string): Promise<any> => {
    const response = await autonomousSystemApi.get(`/systems/${id}/performance`);
    return response.data;
  },

  // Configuration Management
  updateSystemConfig: async (id: string, config: any): Promise<AutonomousSystem> => {
    const response = await autonomousSystemApi.put(`/systems/${id}/config`, config);
    return response.data;
  },

  getAutomationRules: async (id: string): Promise<any[]> => {
    const response = await autonomousSystemApi.get(`/systems/${id}/automation-rules`);
    return response.data;
  },

  createAutomationRule: async (id: string, rule: any): Promise<any> => {
    const response = await autonomousSystemApi.post(`/systems/${id}/automation-rules`, rule);
    return response.data;
  },

  updateAutomationRule: async (systemId: string, ruleId: string, rule: any): Promise<any> => {
    const response = await autonomousSystemApi.put(`/systems/${id}/automation-rules/${ruleId}`, rule);
    return response.data;
  },

  deleteAutomationRule: async (systemId: string, ruleId: string): Promise<void> => {
    await autonomousSystemApi.delete(`/systems/${id}/automation-rules/${ruleId}`);
  },

  // Monitoring and Alerts
  getSystemMetrics: async (id: string, timeRange?: string): Promise<any> => {
    const params = timeRange ? { timeRange } : {};
    const response = await autonomousSystemApi.get(`/systems/${id}/metrics`, { params });
    return response.data;
  },

  getSystemAlerts: async (id: string, status?: string): Promise<any[]> => {
    const params = status ? { status } : {};
    const response = await autonomousSystemApi.get(`/systems/${id}/alerts`, { params });
    return response.data;
  },

  acknowledgeAlert: async (systemId: string, alertId: string): Promise<void> => {
    await autonomousSystemApi.post(`/systems/${systemId}/alerts/${alertId}/acknowledge`);
  },

  resolveAlert: async (systemId: string, alertId: string, resolution: any): Promise<void> => {
    await autonomousSystemApi.post(`/systems/${systemId}/alerts/${alertId}/resolve`, resolution);
  },
};

// Autonomous Decisions API

export const autonomousDecisionApiClient = {
  // Decision Management
  getAllDecisions: async (systemId?: string, status?: string): Promise<AutonomousDecision[]> => {
    const params: any = {};
    if (systemId) params.systemId = systemId;
    if (status) params.status = status;
    const response = await autonomousSystemApi.get('/decisions', { params });
    return response.data;
  },

  getDecisionById: async (id: string): Promise<AutonomousDecision> => {
    const response = await autonomousSystemApi.get(`/decisions/${id}`);
    return response.data;
  },

  createDecision: async (decision: Partial<AutonomousDecision>): Promise<AutonomousDecision> => {
    const response = await autonomousSystemApi.post('/decisions', decision);
    return response.data;
  },

  updateDecision: async (id: string, decision: Partial<AutonomousDecision>): Promise<AutonomousDecision> => {
    const response = await autonomousSystemApi.put(`/decisions/${id}`, decision);
    return response.data;
  },

  // Decision Execution
  executeDecision: async (id: string): Promise<any> => {
    const response = await autonomousSystemApi.post(`/decisions/${id}/execute`);
    return response.data;
  },

  approveDecision: async (id: string, approval: any): Promise<AutonomousDecision> => {
    const response = await autonomousSystemApi.post(`/decisions/${id}/approve`, approval);
    return response.data;
  },

  rejectDecision: async (id: string, rejection: any): Promise<AutonomousDecision> => {
    const response = await autonomousSystemApi.post(`/decisions/${id}/reject`, rejection);
    return response.data;
  },

  requestMoreInfo: async (id: string, request: any): Promise<AutonomousDecision> => {
    const response = await autonomousSystemApi.post(`/decisions/${id}/request-info`, request);
    return response.data;
  },

  // Decision Analytics
  getDecisionAnalytics: async (systemId?: string, timeRange?: string): Promise<any> => {
    const params: any = {};
    if (systemId) params.systemId = systemId;
    if (timeRange) params.timeRange = timeRange;
    const response = await autonomousSystemApi.get('/decisions/analytics', { params });
    return response.data;
  },

  getDecisionTrends: async (systemId?: string): Promise<any> => {
    const params = systemId ? { systemId } : {};
    const response = await autonomousSystemApi.get('/decisions/trends', { params });
    return response.data;
  },
};

// Autonomous Tasks API

export const autonomousTaskApiClient = {
  // Task Management
  getAllTasks: async (systemId?: string, status?: string, priority?: string): Promise<AutonomousTask[]> => {
    const params: any = {};
    if (systemId) params.systemId = systemId;
    if (status) params.status = status;
    if (priority) params.priority = priority;
    const response = await autonomousSystemApi.get('/tasks', { params });
    return response.data;
  },

  getTaskById: async (id: string): Promise<AutonomousTask> => {
    const response = await autonomousSystemApi.get(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (task: Partial<AutonomousTask>): Promise<AutonomousTask> => {
    const response = await autonomousSystemApi.post('/tasks', task);
    return response.data;
  },

  updateTask: async (id: string, task: Partial<AutonomousTask>): Promise<AutonomousTask> => {
    const response = await autonomousSystemApi.put(`/tasks/${id}`, task);
    return response.data;
  },

  deleteTask: async (id: string): Promise<void> => {
    await autonomousSystemApi.delete(`/tasks/${id}`);
  },

  // Task Execution
  startTask: async (id: string): Promise<AutonomousTask> => {
    const response = await autonomousSystemApi.post(`/tasks/${id}/start`);
    return response.data;
  },

  pauseTask: async (id: string): Promise<AutonomousTask> => {
    const response = await autonomousSystemApi.post(`/tasks/${id}/pause`);
    return response.data;
  },

  resumeTask: async (id: string): Promise<AutonomousTask> => {
    const response = await autonomousSystemApi.post(`/tasks/${id}/resume`);
    return response.data;
  },

  completeTask: async (id: string, completion: any): Promise<AutonomousTask> => {
    const response = await autonomousSystemApi.post(`/tasks/${id}/complete`, completion);
    return response.data;
  },

  cancelTask: async (id: string, reason: string): Promise<AutonomousTask> => {
    const response = await autonomousSystemApi.post(`/tasks/${id}/cancel`, { reason });
    return response.data;
  },

  // Task Dependencies
  getTaskDependencies: async (taskId: string): Promise<TaskDependency[]> => {
    const response = await autonomousSystemApi.get(`/tasks/${taskId}/dependencies`);
    return response.data;
  },

  addTaskDependency: async (taskId: string, dependency: Partial<TaskDependency>): Promise<TaskDependency> => {
    const response = await autonomousSystemApi.post(`/tasks/${taskId}/dependencies`, dependency);
    return response.data;
  },

  removeTaskDependency: async (taskId: string, dependencyId: string): Promise<void> => {
    await autonomousSystemApi.delete(`/tasks/${taskId}/dependencies/${dependencyId}`);
  },

  // Task Monitoring
  getTaskProgress: async (id: string): Promise<any> => {
    const response = await autonomousSystemApi.get(`/tasks/${id}/progress`);
    return response.data;
  },

  getTaskLogs: async (id: string, level?: string): Promise<any[]> => {
    const params = level ? { level } : {};
    const response = await autonomousSystemApi.get(`/tasks/${id}/logs`, { params });
    return response.data;
  },

  getTaskMetrics: async (id: string): Promise<any> => {
    const response = await autonomousSystemApi.get(`/tasks/${id}/metrics`);
    return response.data;
  },

  // Task Analytics
  getTaskAnalytics: async (systemId?: string, timeRange?: string): Promise<any> => {
    const params: any = {};
    if (systemId) params.systemId = systemId;
    if (timeRange) params.timeRange = timeRange;
    const response = await autonomousSystemApi.get('/tasks/analytics', { params });
    return response.data;
  },

  getTaskPerformance: async (systemId?: string): Promise<any> => {
    const params = systemId ? { systemId } : {};
    const response = await autonomousSystemApi.get('/tasks/performance', { params });
    return response.data;
  },
};

// Autonomous Optimization API

export const autonomousOptimizationApiClient = {
  // Optimization Management
  getAllOptimizations: async (systemId?: string, status?: string): Promise<AutonomousOptimization[]> => {
    const params: any = {};
    if (systemId) params.systemId = systemId;
    if (status) params.status = status;
    const response = await autonomousSystemApi.get('/optimizations', { params });
    return response.data;
  },

  getOptimizationById: async (id: string): Promise<AutonomousOptimization> => {
    const response = await autonomousSystemApi.get(`/optimizations/${id}`);
    return response.data;
  },

  createOptimization: async (optimization: Partial<AutonomousOptimization>): Promise<AutonomousOptimization> => {
    const response = await autonomousSystemApi.post('/optimizations', optimization);
    return response.data;
  },

  updateOptimization: async (id: string, optimization: Partial<AutonomousOptimization>): Promise<AutonomousOptimization> => {
    const response = await autonomousSystemApi.put(`/optimizations/${id}`, optimization);
    return response.data;
  },

  deleteOptimization: async (id: string): Promise<void> => {
    await autonomousSystemApi.delete(`/optimizations/${id}`);
  },

  // Optimization Execution
  startOptimization: async (id: string): Promise<AutonomousOptimization> => {
    const response = await autonomousSystemApi.post(`/optimizations/${id}/start`);
    return response.data;
  },

  pauseOptimization: async (id: string): Promise<AutonomousOptimization> => {
    const response = await autonomousSystemApi.post(`/optimizations/${id}/pause`);
    return response.data;
  },

  resumeOptimization: async (id: string): Promise<AutonomousOptimization> => {
    const response = await autonomousSystemApi.post(`/optimizations/${id}/resume`);
    return response.data;
  },

  completeOptimization: async (id: string, results: any): Promise<AutonomousOptimization> => {
    const response = await autonomousSystemApi.post(`/optimizations/${id}/complete`, results);
    return response.data;
  },

  cancelOptimization: async (id: string, reason: string): Promise<AutonomousOptimization> => {
    const response = await autonomousSystemApi.post(`/optimizations/${id}/cancel`, { reason });
    return response.data;
  },

  // Optimization Analysis
  getOptimizationAnalysis: async (id: string): Promise<any> => {
    const response = await autonomousSystemApi.get(`/optimizations/${id}/analysis`);
    return response.data;
  },

  getCurrentState: async (id: string): Promise<any> => {
    const response = await autonomousSystemApi.get(`/optimizations/${id}/current-state`);
    return response.data;
  },

  getTargetState: async (id: string): Promise<any> => {
    const response = await autonomousSystemApi.get(`/optimizations/${id}/target-state`);
    return response.data;
  },

  getOptimizationMethodology: async (id: string): Promise<any> => {
    const response = await autonomousSystemApi.get(`/optimizations/${id}/methodology`);
    return response.data;
  },

  // Optimization Results
  getOptimizationResults: async (id: string): Promise<any> => {
    const response = await autonomousSystemApi.get(`/optimizations/${id}/results`);
    return response.data;
  },

  getOptimizationMetrics: async (id: string): Promise<any> => {
    const response = await autonomousSystemApi.get(`/optimizations/${id}/metrics`);
    return response.data;
  },

  getOptimizationBenefits: async (id: string): Promise<any> => {
    const response = await autonomousSystemApi.get(`/optimizations/${id}/benefits`);
    return response.data;
  },

  // Optimization Recommendations
  getOptimizationRecommendations: async (id: string): Promise<any[]> => {
    const response = await autonomousSystemApi.get(`/optimizations/${id}/recommendations`);
    return response.data;
  },

  implementRecommendation: async (optimizationId: string, recommendationId: string): Promise<any> => {
    const response = await autonomousSystemApi.post(`/optimizations/${optimizationId}/recommendations/${recommendationId}/implement`);
    return response.data;
  },

  // Optimization Analytics
  getOptimizationAnalytics: async (systemId?: string, timeRange?: string): Promise<any> => {
    const params: any = {};
    if (systemId) params.systemId = systemId;
    if (timeRange) params.timeRange = timeRange;
    const response = await autonomousSystemApi.get('/optimizations/analytics', { params });
    return response.data;
  },

  getOptimizationTrends: async (systemId?: string): Promise<any> => {
    const params = systemId ? { systemId } : {};
    const response = await autonomousSystemApi.get('/optimizations/trends', { params });
    return response.data;
  },
};

// Dependencies API

export const dependencyApiClient = {
  // Decision Dependencies
  getDecisionDependencies: async (decisionId: string): Promise<DecisionDependency[]> => {
    const response = await autonomousSystemApi.get(`/decisions/${decisionId}/dependencies`);
    return response.data;
  },

  createDecisionDependency: async (decisionId: string, dependency: Partial<DecisionDependency>): Promise<DecisionDependency> => {
    const response = await autonomousSystemApi.post(`/decisions/${decisionId}/dependencies`, dependency);
    return response.data;
  },

  updateDecisionDependency: async (decisionId: string, dependencyId: string, dependency: Partial<DecisionDependency>): Promise<DecisionDependency> => {
    const response = await autonomousSystemApi.put(`/decisions/${decisionId}/dependencies/${dependencyId}`, dependency);
    return response.data;
  },

  deleteDecisionDependency: async (decisionId: string, dependencyId: string): Promise<void> => {
    await autonomousSystemApi.delete(`/decisions/${decisionId}/dependencies/${dependencyId}`);
  },

  // Task Dependencies
  getTaskDependencies: async (taskId: string): Promise<TaskDependency[]> => {
    const response = await autonomousSystemApi.get(`/tasks/${taskId}/dependencies`);
    return response.data;
  },

  createTaskDependency: async (taskId: string, dependency: Partial<TaskDependency>): Promise<TaskDependency> => {
    const response = await autonomousSystemApi.post(`/tasks/${taskId}/dependencies`, dependency);
    return response.data;
  },

  updateTaskDependency: async (taskId: string, dependencyId: string, dependency: Partial<TaskDependency>): Promise<TaskDependency> => {
    const response = await autonomousSystemApi.put(`/tasks/${taskId}/dependencies/${dependencyId}`, dependency);
    return response.data;
  },

  deleteTaskDependency: async (taskId: string, dependencyId: string): Promise<void> => {
    await autonomousSystemApi.delete(`/tasks/${taskId}/dependencies/${dependencyId}`);
  },

  // Optimization Dependencies
  getOptimizationDependencies: async (optimizationId: string): Promise<OptimizationDependency[]> => {
    const response = await autonomousSystemApi.get(`/optimizations/${optimizationId}/dependencies`);
    return response.data;
  },

  createOptimizationDependency: async (optimizationId: string, dependency: Partial<OptimizationDependency>): Promise<OptimizationDependency> => {
    const response = await autonomousSystemApi.post(`/optimizations/${optimizationId}/dependencies`, dependency);
    return response.data;
  },

  updateOptimizationDependency: async (optimizationId: string, dependencyId: string, dependency: Partial<OptimizationDependency>): Promise<OptimizationDependency> => {
    const response = await autonomousSystemApi.put(`/optimizations/${optimizationId}/dependencies/${dependencyId}`, dependency);
    return response.data;
  },

  deleteOptimizationDependency: async (optimizationId: string, dependencyId: string): Promise<void> => {
    await autonomousSystemApi.delete(`/optimizations/${optimizationId}/dependencies/${dependencyId}`);
  },
};

// Dashboard and Analytics API

export const autonomousSystemDashboardApiClient = {
  // Overview Dashboard
  getDashboardOverview: async (): Promise<any> => {
    const response = await autonomousSystemApi.get('/dashboard/overview');
    return response.data;
  },

  getSystemSummary: async (): Promise<any> => {
    const response = await autonomousSystemApi.get('/dashboard/system-summary');
    return response.data;
  },

  getDecisionSummary: async (): Promise<any> => {
    const response = await autonomousSystemApi.get('/dashboard/decision-summary');
    return response.data;
  },

  getTaskSummary: async (): Promise<any> => {
    const response = await autonomousSystemApi.get('/dashboard/task-summary');
    return response.data;
  },

  getOptimizationSummary: async (): Promise<any> => {
    const response = await autonomousSystemApi.get('/dashboard/optimization-summary');
    return response.data;
  },

  // Performance Metrics
  getPerformanceMetrics: async (timeRange?: string): Promise<any> => {
    const params = timeRange ? { timeRange } : {};
    const response = await autonomousSystemApi.get('/dashboard/performance', { params });
    return response.data;
  },

  getAutomationMetrics: async (timeRange?: string): Promise<any> => {
    const params = timeRange ? { timeRange } : {};
    const response = await autonomousSystemApi.get('/dashboard/automation', { params });
    return response.data;
  },

  getEfficiencyMetrics: async (timeRange?: string): Promise<any> => {
    const params = timeRange ? { timeRange } : {};
    const response = await autonomousSystemApi.get('/dashboard/efficiency', { params });
    return response.data;
  },

  // Health and Alerts
  getSystemHealth: async (): Promise<any> => {
    const response = await autonomousSystemApi.get('/dashboard/health');
    return response.data;
  },

  getActiveAlerts: async (): Promise<any[]> => {
    const response = await autonomousSystemApi.get('/dashboard/alerts');
    return response.data;
  },

  getAlertTrends: async (timeRange?: string): Promise<any> => {
    const params = timeRange ? { timeRange } : {};
    const response = await autonomousSystemApi.get('/dashboard/alert-trends', { params });
    return response.data;
  },

  // Reports
  generateReport: async (reportType: string, params: any): Promise<any> => {
    const response = await autonomousSystemApi.post('/reports/generate', { type: reportType, params });
    return response.data;
  },

  getReportHistory: async (): Promise<any[]> => {
    const response = await autonomousSystemApi.get('/reports/history');
    return response.data;
  },

  downloadReport: async (reportId: string): Promise<Blob> => {
    const response = await autonomousSystemApi.get(`/reports/${reportId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },
};

export default autonomousSystemApi;