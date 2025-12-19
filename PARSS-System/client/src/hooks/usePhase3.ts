// Phase 3 React Hooks - Blockchain, IoT, and AI Assistant

import { useState, useEffect, useCallback, useMemo } from 'react';
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
import { phase3Api } from '@/api/phase3Api';

// ========================================
// BLOCKCHAIN HOOKS
// ========================================

export const useBlockchainRecords = (params?: {
  page?: number;
  limit?: number;
  dataType?: string;
  networkType?: string;
  isVerified?: boolean;
  startDate?: string;
  endDate?: string;
}) => {
  const [records, setRecords] = useState<BlockchainRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(params?.page || 1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchRecords = useCallback(async (searchParams = params) => {
    try {
      setLoading(true);
      setError(null);
      const response = await phase3Api.blockchain.getBlockchainRecords(searchParams);
      setRecords(response.records);
      setTotal(response.total);
      setPage(response.page);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blockchain records');
    } finally {
      setLoading(false);
    }
  }, [params]);

  const createRecord = useCallback(async (data: {
    dataType: string;
    data: any;
    metadata: any;
    networkType: 'testnet' | 'mainnet';
  }) => {
    try {
      const newRecord = await phase3Api.blockchain.createBlockchainRecord(data);
      setRecords(prev => [newRecord, ...prev]);
      setTotal(prev => prev + 1);
      return newRecord;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create blockchain record');
      throw err;
    }
  }, []);

  const updateRecord = useCallback(async (id: string, data: Partial<BlockchainRecord>) => {
    try {
      const updatedRecord = await phase3Api.blockchain.updateBlockchainRecord(id, data);
      setRecords(prev => prev.map(record => record.id === id ? updatedRecord : record));
      return updatedRecord;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update blockchain record');
      throw err;
    }
  }, []);

  const deleteRecord = useCallback(async (id: string) => {
    try {
      await phase3Api.blockchain.deleteBlockchainRecord(id);
      setRecords(prev => prev.filter(record => record.id !== id));
      setTotal(prev => prev - 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete blockchain record');
      throw err;
    }
  }, []);

  const verifyRecord = useCallback(async (id: string) => {
    try {
      const result = await phase3Api.blockchain.verifyBlockchainRecord(id);
      setRecords(prev => prev.map(record => 
        record.id === id 
          ? { ...record, isVerified: result.verified, verificationDate: new Date() }
          : record
      ));
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify blockchain record');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return {
    records,
    loading,
    error,
    total,
    page,
    totalPages,
    fetchRecords,
    createRecord,
    updateRecord,
    deleteRecord,
    verifyRecord,
    setPage,
    refetch: () => fetchRecords(),
  };
};

export const useBlockchainTransactions = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(params?.page || 1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchTransactions = useCallback(async (searchParams = params) => {
    try {
      setLoading(true);
      setError(null);
      const response = await phase3Api.blockchain.getBlockchainTransactions(searchParams);
      setTransactions(response.transactions);
      setTotal(response.total);
      setPage(response.page);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blockchain transactions');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    loading,
    error,
    total,
    page,
    totalPages,
    fetchTransactions,
    setPage,
    refetch: () => fetchTransactions(),
  };
};

export const useBlockchainAnalytics = (period?: string) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await phase3Api.blockchain.getBlockchainAnalytics(period);
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blockchain analytics');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics,
  };
};

// ========================================
// IoT HOOKS
// ========================================

export const useIoTDevices = (params?: {
  page?: number;
  limit?: number;
  type?: string;
  category?: string;
  status?: string;
  building?: string;
  location?: string;
}) => {
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(params?.page || 1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchDevices = useCallback(async (searchParams = params) => {
    try {
      setLoading(true);
      setError(null);
      const response = await phase3Api.iot.getIoTDevices(searchParams);
      setDevices(response.devices);
      setTotal(response.total);
      setPage(response.page);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch IoT devices');
    } finally {
      setLoading(false);
    }
  }, [params]);

  const createDevice = useCallback(async (device: Omit<IoTDevice, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newDevice = await phase3Api.iot.createIoTDevice(device);
      setDevices(prev => [newDevice, ...prev]);
      setTotal(prev => prev + 1);
      return newDevice;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create IoT device');
      throw err;
    }
  }, []);

  const updateDevice = useCallback(async (id: string, data: Partial<IoTDevice>) => {
    try {
      const updatedDevice = await phase3Api.iot.updateIoTDevice(id, data);
      setDevices(prev => prev.map(device => device.id === id ? updatedDevice : device));
      return updatedDevice;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update IoT device');
      throw err;
    }
  }, []);

  const deleteDevice = useCallback(async (id: string) => {
    try {
      await phase3Api.iot.deleteIoTDevice(id);
      setDevices(prev => prev.filter(device => device.id !== id));
      setTotal(prev => prev - 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete IoT device');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  return {
    devices,
    loading,
    error,
    total,
    page,
    totalPages,
    fetchDevices,
    createDevice,
    updateDevice,
    deleteDevice,
    setPage,
    refetch: () => fetchDevices(),
  };
};

export const useIoTDeviceStatus = (deviceId: string) => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const deviceStatus = await phase3Api.iot.getDeviceStatus(deviceId);
      setStatus(deviceStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch device status');
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    if (deviceId) {
      fetchStatus();
      // Set up polling for real-time status updates
      const interval = setInterval(fetchStatus, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [fetchStatus]);

  return {
    status,
    loading,
    error,
    refetch: fetchStatus,
  };
};

export const useIoTSensorData = (params?: {
  deviceId?: string;
  dataType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  const [sensorData, setSensorData] = useState<IoTSensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(params?.page || 1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchSensorData = useCallback(async (searchParams = params) => {
    try {
      setLoading(true);
      setError(null);
      const response = await phase3Api.iot.getSensorData(searchParams);
      setSensorData(response.data);
      setTotal(response.total);
      setPage(response.page);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sensor data');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchSensorData();
  }, [fetchSensorData]);

  return {
    sensorData,
    loading,
    error,
    total,
    page,
    totalPages,
    fetchSensorData,
    setPage,
    refetch: () => fetchSensorData(),
  };
};

export const useIoTAlerts = (params?: {
  deviceId?: string;
  severity?: string;
  status?: 'active' | 'acknowledged' | 'resolved';
  alertType?: string;
  page?: number;
  limit?: number;
}) => {
  const [alerts, setAlerts] = useState<IoTAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(params?.page || 1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchAlerts = useCallback(async (searchParams = params) => {
    try {
      setLoading(true);
      setError(null);
      const response = await phase3Api.iot.getIoTAlerts(searchParams);
      setAlerts(response.alerts);
      setTotal(response.total);
      setPage(response.page);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch IoT alerts');
    } finally {
      setLoading(false);
    }
  }, [params]);

  const acknowledgeAlert = useCallback(async (alertId: string, note?: string) => {
    try {
      const updatedAlert = await phase3Api.iot.acknowledgeAlert(alertId, note);
      setAlerts(prev => prev.map(alert => alert.id === alertId ? updatedAlert : alert));
      return updatedAlert;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to acknowledge alert');
      throw err;
    }
  }, []);

  const resolveAlert = useCallback(async (alertId: string, resolution: string) => {
    try {
      const updatedAlert = await phase3Api.iot.resolveAlert(alertId, resolution);
      setAlerts(prev => prev.map(alert => alert.id === alertId ? updatedAlert : alert));
      return updatedAlert;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve alert');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return {
    alerts,
    loading,
    error,
    total,
    page,
    totalPages,
    fetchAlerts,
    acknowledgeAlert,
    resolveAlert,
    setPage,
    refetch: () => fetchAlerts(),
  };
};

export const useIoTAnalytics = (period?: string) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await phase3Api.iot.getIoTAnalytics(period);
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch IoT analytics');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics,
  };
};

// ========================================
// AI ASSISTANT HOOKS
// ========================================

export const useAIAssistants = (params?: {
  type?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}) => {
  const [assistants, setAssistants] = useState<AIAssistant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(params?.page || 1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchAssistants = useCallback(async (searchParams = params) => {
    try {
      setLoading(true);
      setError(null);
      const response = await phase3Api.aiAssistant.getAIAssistants(searchParams);
      setAssistants(response.assistants);
      setTotal(response.total);
      setPage(response.page);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch AI assistants');
    } finally {
      setLoading(false);
    }
  }, [params]);

  const createAssistant = useCallback(async (assistant: Omit<AIAssistant, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newAssistant = await phase3Api.aiAssistant.createAIAssistant(assistant);
      setAssistants(prev => [newAssistant, ...prev]);
      setTotal(prev => prev + 1);
      return newAssistant;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create AI assistant');
      throw err;
    }
  }, []);

  const updateAssistant = useCallback(async (id: string, data: Partial<AIAssistant>) => {
    try {
      const updatedAssistant = await phase3Api.aiAssistant.updateAIAssistant(id, data);
      setAssistants(prev => prev.map(assistant => assistant.id === id ? updatedAssistant : assistant));
      return updatedAssistant;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update AI assistant');
      throw err;
    }
  }, []);

  const deleteAssistant = useCallback(async (id: string) => {
    try {
      await phase3Api.aiAssistant.deleteAIAssistant(id);
      setAssistants(prev => prev.filter(assistant => assistant.id !== id));
      setTotal(prev => prev - 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete AI assistant');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchAssistants();
  }, [fetchAssistants]);

  return {
    assistants,
    loading,
    error,
    total,
    page,
    totalPages,
    fetchAssistants,
    createAssistant,
    updateAssistant,
    deleteAssistant,
    setPage,
    refetch: () => fetchAssistants(),
  };
};

export const useAIChat = (assistantId: string) => {
  const [session, setSession] = useState<{
    sessionId: string;
    conversationId: string;
    welcomeMessage: string;
  } | null>(null);
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSession = useCallback(async (context?: any) => {
    try {
      setLoading(true);
      setError(null);
      const newSession = await phase3Api.aiAssistant.createChatSession(assistantId, context);
      setSession(newSession);
      return newSession;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create chat session');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [assistantId]);

  const sendMessage = useCallback(async (message: string, attachments?: File[], context?: any) => {
    if (!session) {
      throw new Error('No active chat session');
    }

    try {
      setLoading(true);
      setError(null);
      
      // Add user message to local state immediately for better UX
      const userMessage: AIChatMessage = {
        id: `temp-${Date.now()}`,
        conversationId: session.conversationId,
        role: 'user',
        content: message,
        contentType: 'text',
        metadata: {
          sessionId: session.sessionId,
          userId: 'current-user', // This should come from auth context
          context: context || {},
          capabilities: [],
          language: 'en',
          domain: 'general',
          complexity: 'moderate',
          urgency: 'low',
          tags: []
        },
        attachments: attachments ? attachments.map((file, index) => ({
          id: `temp-attachment-${index}`,
          name: file.name,
          type: 'file',
          size: file.size,
          mimeType: file.type,
          uploadedAt: new Date(),
          isProcessed: false,
          processingStatus: 'pending'
        })) : [],
        timestamp: new Date(),
        tokens: 0,
        confidence: 1,
        feedback: {
          helpful: false,
          accurate: false,
          complete: false,
          timestamp: new Date(),
          categories: []
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setMessages(prev => [...prev, userMessage]);

      const response = await phase3Api.aiAssistant.sendMessage({
        conversationId: session.conversationId,
        message,
        attachments,
        context
      });

      // Replace temp user message with actual one and add assistant response
      setMessages(prev => [
        ...prev.filter(msg => msg.id !== userMessage.id),
        {
          ...userMessage,
          id: response.messageId,
          timestamp: response.timestamp
        },
        {
          id: `assistant-${Date.now()}`,
          conversationId: session.conversationId,
          role: 'assistant',
          content: response.response,
          contentType: 'text',
          metadata: {
            sessionId: session.sessionId,
            userId: 'current-user',
            context: context || {},
            capabilities: response.suggestions,
            language: 'en',
            domain: 'general',
            complexity: 'moderate',
            urgency: 'low',
            tags: response.relatedTopics
          },
          attachments: [],
          timestamp: response.timestamp,
          tokens: 0,
          confidence: response.confidence,
          feedback: {
            helpful: false,
            accurate: false,
            complete: false,
            timestamp: new Date(),
            categories: []
          },
          isActive: true,
          createdAt: response.timestamp,
          updatedAt: response.timestamp
        }
      ]);

      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [session]);

  const loadHistory = useCallback(async (conversationId?: string) => {
    const targetConversationId = conversationId || session?.conversationId;
    if (!targetConversationId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await phase3Api.aiAssistant.getConversationHistory(targetConversationId);
      setMessages(response.messages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversation history');
    } finally {
      setLoading(false);
    }
  }, [session]);

  const endConversation = useCallback(async (feedback?: any) => {
    if (!session) return;

    try {
      await phase3Api.aiAssistant.endConversation(session.conversationId, feedback);
      setSession(null);
      setMessages([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end conversation');
      throw err;
    }
  }, [session]);

  const provideFeedback = useCallback(async (messageId: string, feedback: any) => {
    try {
      await phase3Api.aiAssistant.provideFeedback(messageId, feedback);
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, feedback } : msg
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to provide feedback');
      throw err;
    }
  }, []);

  return {
    session,
    messages,
    loading,
    error,
    createSession,
    sendMessage,
    loadHistory,
    endConversation,
    provideFeedback,
  };
};

export const useAIAnalytics = (period?: string) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await phase3Api.aiAssistant.getAIAnalytics(period);
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch AI analytics');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics,
  };
};

// ========================================
// DASHBOARD HOOKS
// ========================================

export const usePhase3Dashboard = () => {
  const [dashboard, setDashboard] = useState<Phase3Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await phase3Api.dashboard.getPhase3Dashboard();
      setDashboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Phase 3 dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    // Set up polling for real-time updates
    const interval = setInterval(fetchDashboard, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  return {
    dashboard,
    loading,
    error,
    refetch: fetchDashboard,
  };
};

export const useSystemHealth = () => {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await phase3Api.systemStatus.getSystemHealth();
      setHealth(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch system health');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    // Set up polling for real-time health updates
    const interval = setInterval(fetchHealth, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [fetchHealth]);

  return {
    health,
    loading,
    error,
    refetch: fetchHealth,
  };
};

// ========================================
// REAL-TIME HOOKS
// ========================================

export const useRealtimeUpdates = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // This would typically connect to a WebSocket or Server-Sent Events endpoint
    // For now, we'll simulate with polling
    setIsConnected(true);

    // In a real implementation, you would:
    // const ws = new WebSocket('ws://localhost:5000/ws');
    // ws.onopen = () => setIsConnected(true);
    // ws.onclose = () => setIsConnected(false);
    // ws.onmessage = (event) => {
    //   const data = JSON.parse(event.data);
    //   // Handle real-time updates
    // };

    return () => {
      setIsConnected(false);
    };
  }, []);

  return { isConnected };
};

// ========================================
// UTILITY HOOKS
// ========================================

export const usePhase3Notifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);

  const addNotification = useCallback((notification: any) => {
    setNotifications(prev => [notification, ...prev].slice(0, 50)); // Keep last 50 notifications
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
  };
};

export const usePhase3Filters = () => {
  const [filters, setFilters] = useState({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date(),
    },
    searchQuery: '',
    selectedCategories: [],
    selectedTypes: [],
    status: 'all',
    severity: 'all',
  });

  const updateFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date(),
      },
      searchQuery: '',
      selectedCategories: [],
      selectedTypes: [],
      status: 'all',
      severity: 'all',
    });
  }, []);

  const filteredData = useCallback((data: any[]) => {
    return data.filter(item => {
      // Apply search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const searchableFields = ['name', 'description', 'type', 'category', 'status'];
        const matchesSearch = searchableFields.some(field => 
          item[field]?.toString().toLowerCase().includes(query)
        );
        if (!matchesSearch) return false;
      }

      // Apply category filter
      if (filters.selectedCategories.length > 0 && !filters.selectedCategories.includes(item.category)) {
        return false;
      }

      // Apply type filter
      if (filters.selectedTypes.length > 0 && !filters.selectedTypes.includes(item.type)) {
        return false;
      }

      // Apply status filter
      if (filters.status !== 'all' && item.status !== filters.status) {
        return false;
      }

      // Apply severity filter
      if (filters.severity !== 'all' && item.severity !== filters.severity) {
        return false;
      }

      // Apply date range filter
      if (item.timestamp) {
        const itemDate = new Date(item.timestamp);
        if (itemDate < filters.dateRange.start || itemDate > filters.dateRange.end) {
          return false;
        }
      }

      return true;
    });
  }, [filters]);

  return {
    filters,
    updateFilter,
    resetFilters,
    filteredData,
  };
};