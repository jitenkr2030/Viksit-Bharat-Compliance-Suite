// Phase 3 API Client - Blockchain, IoT, and AI Assistant

import axios, { AxiosResponse } from 'axios';
import {
  BlockchainRecord,
  BlockchainTransaction,
  IoTDevice,
  IoTSensorData,
  IoTAlert,
  AIAssistant,
  AIChatMessage,
  Phase3Dashboard,
  MaintenanceSchedule,
  BlockchainDashboard,
  IoTDashboard,
  AIAssistantDashboard,
  Phase3Alerts,
  Phase3Insights
} from '@/types/phase3';

// API Base Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
apiClient.interceptors.request.use(
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

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ========================================
// BLOCKCHAIN API METHODS
// ========================================

export const blockchainApi = {
  // Blockchain Records
  async getBlockchainRecords(params?: {
    page?: number;
    limit?: number;
    dataType?: string;
    networkType?: string;
    isVerified?: boolean;
    startDate?: string;
    endDate?: string;
  }): Promise<{ records: BlockchainRecord[]; total: number; page: number; totalPages: number }> {
    const response: AxiosResponse = await apiClient.get('/blockchain/records', { params });
    return response.data;
  },

  async getBlockchainRecord(id: string): Promise<BlockchainRecord> {
    const response: AxiosResponse = await apiClient.get(`/blockchain/records/${id}`);
    return response.data;
  },

  async createBlockchainRecord(data: {
    dataType: string;
    data: any;
    metadata: any;
    networkType: 'testnet' | 'mainnet';
  }): Promise<BlockchainRecord> {
    const response: AxiosResponse = await apiClient.post('/blockchain/records', data);
    return response.data;
  },

  async updateBlockchainRecord(id: string, data: Partial<BlockchainRecord>): Promise<BlockchainRecord> {
    const response: AxiosResponse = await apiClient.put(`/blockchain/records/${id}`, data);
    return response.data;
  },

  async deleteBlockchainRecord(id: string): Promise<void> {
    await apiClient.delete(`/blockchain/records/${id}`);
  },

  async verifyBlockchainRecord(id: string): Promise<{ verified: boolean; blockNumber?: number }> {
    const response: AxiosResponse = await apiClient.post(`/blockchain/records/${id}/verify`);
    return response.data;
  },

  // Blockchain Transactions
  async getBlockchainTransactions(params?: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ transactions: BlockchainTransaction[]; total: number; page: number; totalPages: number }> {
    const response: AxiosResponse = await apiClient.get('/blockchain/transactions', { params });
    return response.data;
  },

  async getBlockchainTransaction(id: string): Promise<BlockchainTransaction> {
    const response: AxiosResponse = await apiClient.get(`/blockchain/transactions/${id}`);
    return response.data;
  },

  async getTransactionByHash(hash: string): Promise<BlockchainTransaction> {
    const response: AxiosResponse = await apiClient.get(`/blockchain/transactions/hash/${hash}`);
    return response.data;
  },

  // Blockchain Analytics
  async getBlockchainAnalytics(period?: string): Promise<{
    totalRecords: number;
    recordsByType: { [key: string]: number };
    transactionVolume: { date: string; count: number }[];
    networkStats: {
      testnet: { records: number; transactions: number };
      mainnet: { records: number; transactions: number };
    };
  }> {
    const response: AxiosResponse = await apiClient.get('/blockchain/analytics', {
      params: { period }
    });
    return response.data;
  },

  async getBlockchainPerformance(): Promise<{
    averageConfirmationTime: number;
    gasUsage: number;
    costPerTransaction: number;
    successRate: number;
    throughput: number;
  }> {
    const response: AxiosResponse = await apiClient.get('/blockchain/performance');
    return response.data;
  },

  // Blockchain Networks
  async getBlockchainNetworks(): Promise<Array<{
    id: string;
    name: string;
    type: 'testnet' | 'mainnet';
    chainId: number;
    provider: string;
    status: string;
    blockHeight: number;
  }>> {
    const response: AxiosResponse = await apiClient.get('/blockchain/networks');
    return response.data;
  },

  async updateNetworkConfiguration(networkId: string, config: any): Promise<void> {
    await apiClient.put(`/blockchain/networks/${networkId}`, config);
  },
};

// ========================================
// IoT API METHODS
// ========================================

export const iotApi = {
  // IoT Devices
  async getIoTDevices(params?: {
    page?: number;
    limit?: number;
    type?: string;
    category?: string;
    status?: string;
    building?: string;
    location?: string;
  }): Promise<{ devices: IoTDevice[]; total: number; page: number; totalPages: number }> {
    const response: AxiosResponse = await apiClient.get('/iot/devices', { params });
    return response.data;
  },

  async getIoTDevice(id: string): Promise<IoTDevice> {
    const response: AxiosResponse = await apiClient.get(`/iot/devices/${id}`);
    return response.data;
  },

  async createIoTDevice(device: Omit<IoTDevice, 'id' | 'createdAt' | 'updatedAt'>): Promise<IoTDevice> {
    const response: AxiosResponse = await apiClient.post('/iot/devices', device);
    return response.data;
  },

  async updateIoTDevice(id: string, data: Partial<IoTDevice>): Promise<IoTDevice> {
    const response: AxiosResponse = await apiClient.put(`/iot/devices/${id}`, data);
    return response.data;
  },

  async deleteIoTDevice(id: string): Promise<void> {
    await apiClient.delete(`/iot/devices/${id}`);
  },

  async getDeviceStatus(id: string): Promise<{
    status: string;
    lastHeartbeat: Date;
    batteryLevel?: number;
    signalStrength?: number;
    uptime: number;
  }> {
    const response: AxiosResponse = await apiClient.get(`/iot/devices/${id}/status`);
    return response.data;
  },

  async calibrateDevice(id: string, calibrationData: any): Promise<{ calibrated: boolean }> {
    const response: AxiosResponse = await apiClient.post(`/iot/devices/${id}/calibrate`, calibrationData);
    return response.data;
  },

  async getDeviceMaintenanceSchedule(id: string): Promise<MaintenanceSchedule> {
    const response: AxiosResponse = await apiClient.get(`/iot/devices/${id}/maintenance`);
    return response.data;
  },

  async updateMaintenanceSchedule(id: string, schedule: MaintenanceSchedule): Promise<MaintenanceSchedule> {
    const response: AxiosResponse = await apiClient.put(`/iot/devices/${id}/maintenance`, schedule);
    return response.data;
  },

  // IoT Sensor Data
  async getSensorData(params?: {
    deviceId?: string;
    dataType?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: IoTSensorData[]; total: number; page: number; totalPages: number }> {
    const response: AxiosResponse = await apiClient.get('/iot/sensor-data', { params });
    return response.data;
  },

  async getSensorDataByDevice(deviceId: string, timeRange?: string): Promise<IoTSensorData[]> {
    const response: AxiosResponse = await apiClient.get(`/iot/devices/${deviceId}/data`, {
      params: { timeRange }
    });
    return response.data;
  },

  async getAggregatedSensorData(params: {
    deviceIds?: string[];
    dataType?: string;
    aggregation: 'hourly' | 'daily' | 'weekly' | 'monthly';
    startDate: string;
    endDate: string;
  }): Promise<{
    aggregatedData: Array<{
      timestamp: string;
      value: number;
      unit?: string;
      deviceCount: number;
    }>;
    statistics: {
      min: number;
      max: number;
      average: number;
      median: number;
      standardDeviation: number;
    };
  }> {
    const response: AxiosResponse = await apiClient.get('/iot/sensor-data/aggregated', { params });
    return response.data;
  },

  // IoT Alerts
  async getIoTAlerts(params?: {
    deviceId?: string;
    severity?: string;
    status?: 'active' | 'acknowledged' | 'resolved';
    alertType?: string;
    page?: number;
    limit?: number;
  }): Promise<{ alerts: IoTAlert[]; total: number; page: number; totalPages: number }> {
    const response: AxiosResponse = await apiClient.get('/iot/alerts', { params });
    return response.data;
  },

  async getIoTAlert(id: string): Promise<IoTAlert> {
    const response: AxiosResponse = await apiClient.get(`/iot/alerts/${id}`);
    return response.data;
  },

  async acknowledgeAlert(id: string, note?: string): Promise<IoTAlert> {
    const response: AxiosResponse = await apiClient.post(`/iot/alerts/${id}/acknowledge`, { note });
    return response.data;
  },

  async resolveAlert(id: string, resolution: string): Promise<IoTAlert> {
    const response: AxiosResponse = await apiClient.post(`/iot/alerts/${id}/resolve`, { resolution });
    return response.data;
  },

  async createAlertRule(rule: {
    deviceId: string;
    alertType: string;
    conditions: any;
    actions: any[];
  }): Promise<{ created: boolean; ruleId: string }> {
    const response: AxiosResponse = await apiClient.post('/iot/alert-rules', rule);
    return response.data;
  },

  async getAlertRules(deviceId?: string): Promise<Array<{
    id: string;
    deviceId: string;
    alertType: string;
    conditions: any;
    actions: any[];
    isActive: boolean;
  }>> {
    const response: AxiosResponse = await apiClient.get('/iot/alert-rules', {
      params: { deviceId }
    });
    return response.data;
  },

  // IoT Analytics
  async getIoTAnalytics(period?: string): Promise<{
    deviceStats: {
      total: number;
      active: number;
      maintenance: number;
      error: number;
      offline: number;
    };
    dataStats: {
      totalRecords: number;
      qualityDistribution: { [key: string]: number };
      dataTypeDistribution: { [key: string]: number };
    };
    alertStats: {
      total: number;
      bySeverity: { [key: string]: number };
      resolutionRate: number;
      averageResponseTime: number;
    };
    maintenanceStats: {
      upcoming: number;
      overdue: number;
      completed: number;
    };
  }> {
    const response: AxiosResponse = await apiClient.get('/iot/analytics', {
      params: { period }
    });
    return response.data;
  },

  async getIoTCoverage(): Promise<{
    buildings: Array<{
      buildingId: string;
      name: string;
      totalDevices: number;
      activeDevices: number;
      coveragePercentage: number;
    }>;
    complianceAreas: Array<{
      area: string;
      requiredDevices: number;
      actualDevices: number;
      complianceScore: number;
    }>;
  }> {
    const response: AxiosResponse = await apiClient.get('/iot/coverage');
    return response.data;
  },

  async getIoTPerformance(): Promise<{
    deviceUptime: number;
    dataAccuracy: number;
    alertResponseTime: number;
    batteryLife: number;
    maintenanceEfficiency: number;
  }> {
    const response: AxiosResponse = await apiClient.get('/iot/performance');
    return response.data;
  },
};

// ========================================
// AI ASSISTANT API METHODS
// ========================================

export const aiAssistantApi = {
  // AI Assistant Management
  async getAIAssistants(params?: {
    type?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ assistants: AIAssistant[]; total: number; page: number; totalPages: number }> {
    const response: AxiosResponse = await apiClient.get('/ai-assistant/assistants', { params });
    return response.data;
  },

  async getAIAssistant(id: string): Promise<AIAssistant> {
    const response: AxiosResponse = await apiClient.get(`/ai-assistant/assistants/${id}`);
    return response.data;
  },

  async createAIAssistant(assistant: Omit<AIAssistant, 'id' | 'createdAt' | 'updatedAt'>): Promise<AIAssistant> {
    const response: AxiosResponse = await apiClient.post('/ai-assistant/assistants', assistant);
    return response.data;
  },

  async updateAIAssistant(id: string, data: Partial<AIAssistant>): Promise<AIAssistant> {
    const response: AxiosResponse = await apiClient.put(`/ai-assistant/assistants/${id}`, data);
    return response.data;
  },

  async deleteAIAssistant(id: string): Promise<void> {
    await apiClient.delete(`/ai-assistant/assistants/${id}`);
  },

  async trainAIAssistant(id: string, trainingData: any): Promise<{
    trainingId: string;
    status: string;
    estimatedCompletion: Date;
  }> {
    const response: AxiosResponse = await apiClient.post(`/ai-assistant/assistants/${id}/train`, trainingData);
    return response.data;
  },

  async getTrainingStatus(assistantId: string, trainingId: string): Promise<{
    status: string;
    progress: number;
    currentStep: string;
    estimatedCompletion: Date;
    results?: any;
  }> {
    const response: AxiosResponse = await apiClient.get(`/ai-assistant/assistants/${assistantId}/training/${trainingId}`);
    return response.data;
  },

  // AI Chat Conversations
  async createChatSession(assistantId: string, context?: any): Promise<{
    sessionId: string;
    conversationId: string;
    welcomeMessage: string;
  }> {
    const response: AxiosResponse = await apiClient.post('/ai-assistant/chat/session', {
      assistantId,
      context
    });
    return response.data;
  },

  async sendMessage(data: {
    conversationId: string;
    message: string;
    attachments?: File[];
    context?: any;
  }): Promise<{
    messageId: string;
    response: string;
    confidence: number;
    suggestions: string[];
    relatedTopics: string[];
    timestamp: Date;
  }> {
    const formData = new FormData();
    formData.append('conversationId', data.conversationId);
    formData.append('message', data.message);
    formData.append('context', JSON.stringify(data.context || {}));

    if (data.attachments) {
      data.attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file);
      });
    }

    const response: AxiosResponse = await apiClient.post('/ai-assistant/chat/message', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getConversationHistory(conversationId: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<{ messages: AIChatMessage[]; total: number; page: number; totalPages: number }> {
    const response: AxiosResponse = await apiClient.get(`/ai-assistant/chat/conversations/${conversationId}/history`, {
      params
    });
    return response.data;
  },

  async getConversations(params?: {
    assistantId?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    status?: 'active' | 'completed' | 'abandoned';
    page?: number;
    limit?: number;
  }): Promise<{
    conversations: Array<{
      id: string;
      userId: string;
      assistantId: string;
      startTime: Date;
      endTime?: Date;
      messageCount: number;
      duration: number;
      satisfaction?: number;
      outcome: string;
      topics: string[];
    }>;
    total: number;
    page: number;
    totalPages: number;
  }> {
    const response: AxiosResponse = await apiClient.get('/ai-assistant/chat/conversations', { params });
    return response.data;
  },

  async endConversation(conversationId: string, feedback?: {
    rating: number;
    helpful: boolean;
    accurate: boolean;
    complete: boolean;
    comments?: string;
    categories: Array<{
      category: string;
      score: number;
      comment?: string;
    }>;
  }): Promise<void> {
    await apiClient.post(`/ai-assistant/chat/conversations/${conversationId}/end`, { feedback });
  },

  async provideFeedback(messageId: string, feedback: {
    rating?: number;
    helpful: boolean;
    accurate: boolean;
    complete: boolean;
    comments?: string;
    categories: Array<{
      category: string;
      score: number;
      comment?: string;
    }>;
  }): Promise<void> {
    await apiClient.post(`/ai-assistant/chat/messages/${messageId}/feedback`, feedback);
  },

  // AI Assistant Analytics
  async getAIAnalytics(period?: string): Promise<{
    usage: {
      totalInteractions: number;
      activeUsers: number;
      peakUsage: {
        timestamp: Date;
        requestsPerMinute: number;
      };
      usageByCapability: { [key: string]: number };
    };
    performance: {
      averageResponseTime: number;
      accuracy: number;
      taskCompletionRate: number;
      userSatisfaction: number;
      errorRate: number;
    };
    conversations: {
      total: number;
      completed: number;
      abandoned: number;
      escalated: number;
      averageDuration: number;
      averageMessages: number;
    };
  }> {
    const response: AxiosResponse = await apiClient.get('/ai-assistant/analytics', {
      params: { period }
    });
    return response.data;
  },

  async getAIUsageMetrics(): Promise<{
    dailyInteractions: number;
    peakHours: Array<{
      hour: number;
      interactions: number;
      averageResponseTime: number;
    }>;
    popularCapabilities: Array<{
      capability: string;
      usageCount: number;
      successRate: number;
      averageRating: number;
    }>;
    userEngagement: {
      activeUsers: number;
      sessionDuration: number;
      messagesPerSession: number;
      returnRate: number;
      userRetention: number;
    };
  }> {
    const response: AxiosResponse = await apiClient.get('/ai-assistant/usage-metrics');
    return response.data;
  },

  async getAISatisfactionMetrics(): Promise<{
    overall: number;
    byCategory: Array<{
      category: string;
      score: number;
      responseCount: number;
      improvementAreas: string[];
    }>;
    trends: Array<{
      period: string;
      score: number;
      change: number;
      sampleSize: number;
    }>;
    feedbackSummary: {
      positiveComments: string[];
      negativeComments: string[];
      improvementSuggestions: string[];
      commonThemes: string[];
    };
  }> {
    const response: AxiosResponse = await apiClient.get('/ai-assistant/satisfaction');
    return response.data;
  },

  // AI Knowledge Base
  async getKnowledgeBase(assistantId: string): Promise<{
    id: string;
    name: string;
    sources: Array<{
      type: string;
      name: string;
      url?: string;
      lastUpdated: Date;
      priority: number;
      isActive: boolean;
      accessLevel: string;
    }>;
    coverage: {
      regulatoryFrameworks: string[];
      complianceAreas: string[];
      industrySectors: string[];
      geographicRegions: string[];
      completeness: number;
    };
    statistics: {
      totalDocuments: number;
      lastUpdated: Date;
      accuracy: number;
      freshness: number;
    };
  }> {
    const response: AxiosResponse = await apiClient.get(`/ai-assistant/assistants/${assistantId}/knowledge-base`);
    return response.data;
  },

  async updateKnowledgeBase(assistantId: string, updates: {
    addSources?: any[];
    removeSources?: string[];
    updatePriorities?: { [key: string]: number };
  }): Promise<{ updated: boolean; changes: any }> {
    const response: AxiosResponse = await apiClient.put(`/ai-assistant/assistants/${assistantId}/knowledge-base`, updates);
    return response.data;
  },

  async refreshKnowledgeBase(assistantId: string): Promise<{
    refreshId: string;
    status: string;
    estimatedCompletion: Date;
  }> {
    const response: AxiosResponse = await apiClient.post(`/ai-assistant/assistants/${assistantId}/knowledge-base/refresh`);
    return response.data;
  },
};

// ========================================
// DASHBOARD API METHODS
// ========================================

export const phase3DashboardApi = {
  async getPhase3Dashboard(): Promise<Phase3Dashboard> {
    const response: AxiosResponse = await apiClient.get('/phase3/dashboard');
    return response.data;
  },

  async getBlockchainDashboard(): Promise<BlockchainDashboard> {
    const response: AxiosResponse = await apiClient.get('/phase3/dashboard/blockchain');
    return response.data;
  },

  async getIoTDashboard(): Promise<IoTDashboard> {
    const response: AxiosResponse = await apiClient.get('/phase3/dashboard/iot');
    return response.data;
  },

  async getAIAssistantDashboard(): Promise<AIAssistantDashboard> {
    const response: AxiosResponse = await apiClient.get('/phase3/dashboard/ai-assistant');
    return response.data;
  },

  async getPhase3Alerts(): Promise<Phase3Alerts> {
    const response: AxiosResponse = await apiClient.get('/phase3/alerts');
    return response.data;
  },

  async getPhase3Insights(): Promise<Phase3Insights> {
    const response: AxiosResponse = await apiClient.get('/phase3/insights');
    return response.data;
  },
};

// ========================================
// SYSTEM STATUS API METHODS
// ========================================

export const systemStatusApi = {
  async getSystemHealth(): Promise<{
    overall: 'healthy' | 'degraded' | 'critical';
    components: Array<{
      component: string;
      status: 'healthy' | 'degraded' | 'critical' | 'unknown';
      uptime: number;
      responseTime: number;
      errorRate: number;
      lastCheck: Date;
    }>;
    lastCheck: Date;
    uptime: number;
  }> {
    const response: AxiosResponse = await apiClient.get('/phase3/health');
    return response.data;
  },

  async getPerformanceMetrics(): Promise<{
    responseTime: number;
    throughput: number;
    accuracy: number;
    availability: number;
    userSatisfaction: number;
  }> {
    const response: AxiosResponse = await apiClient.get('/phase3/performance');
    return response.data;
  },

  async getSystemLogs(params?: {
    level?: string;
    component?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    logs: Array<{
      id: string;
      level: string;
      message: string;
      timestamp: Date;
      source: string;
      metadata: any;
    }>;
    total: number;
    page: number;
    totalPages: number;
  }> {
    const response: AxiosResponse = await apiClient.get('/phase3/logs', { params });
    return response.data;
  },
};

// ========================================
// EXPORT ALL APIs
// ========================================

export const phase3Api = {
  blockchain: blockchainApi,
  iot: iotApi,
  aiAssistant: aiAssistantApi,
  dashboard: phase3DashboardApi,
  systemStatus: systemStatusApi,
};

export default phase3Api;