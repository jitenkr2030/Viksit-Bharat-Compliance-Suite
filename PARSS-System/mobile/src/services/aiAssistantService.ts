import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';

// Environment-based API configuration
const getApiBaseUrl = () => {
  if (__DEV__) {
    return 'http://localhost:5000/api';
  }
  return Config.API_BASE_URL || 'https://your-production-domain.com/api';
};

const API_BASE_URL = getApiBaseUrl();

export interface AIAssistant {
  id: string;
  name: string;
  type: string;
  description: string;
  capabilities: string[];
  isActive: boolean;
  model: string;
  version: string;
  configuration: {
    maxTokens: number;
    temperature: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
    systemPrompt: string;
    contextWindow: number;
  };
  knowledgeBase: {
    sources: Array<{
      type: string;
      name: string;
      url?: string;
      lastUpdated: string;
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
  };
  performance: {
    totalInteractions: number;
    averageResponseTime: number;
    accuracy: number;
    userSatisfaction: number;
    lastTraining: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AIChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    model?: string;
    tokens?: number;
    confidence?: number;
    suggestions?: string[];
    relatedTopics?: string[];
    attachments?: Array<{
      type: string;
      name: string;
      url?: string;
    }>;
  };
  feedback?: {
    rating?: number;
    helpful: boolean;
    accurate: boolean;
    complete: boolean;
    comments?: string;
    categories?: Array<{
      category: string;
      score: number;
      comment?: string;
    }>;
  };
}

export interface AIConversation {
  id: string;
  userId: string;
  assistantId: string;
  startTime: string;
  endTime?: string;
  messageCount: number;
  duration: number;
  satisfaction?: number;
  outcome: string;
  topics: string[];
  metadata?: Record<string, any>;
}

export interface AIAnalytics {
  usage: {
    totalInteractions: number;
    activeUsers: number;
    peakUsage: {
      timestamp: string;
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
}

class AIAssistantService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const token = await AsyncStorage.getItem('authToken');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      // Handle 401
      if ( errors with token refreshresponse.status === 401 && !options.headers?.['x-refreshing-token']) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          const newToken = await AsyncStorage.getItem('authToken');
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${newToken}`,
            'x-refreshing-token': 'true'
          };
          return this.makeRequest(endpoint, options);
        } else {
          throw new Error('Session expired. Please log in again.');
        }
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('AI Assistant API Error:', error);
      throw error;
    }
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (!refreshToken) return false;

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.tokens) {
          await AsyncStorage.setItem('authToken', data.tokens.access_token);
          if (data.tokens.refresh_token) {
            await AsyncStorage.setItem('refreshToken', data.tokens.refresh_token);
          }
        } else {
          await AsyncStorage.setItem('authToken', data.access_token);
          if (data.refresh_token) {
            await AsyncStorage.setItem('refreshToken', data.refresh_token);
          }
        }
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
    return false;
  }

  // AI Assistant Management
  async getAIAssistants(params?: {
    type?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    return this.makeRequest(`/ai-assistant/assistants?${queryParams.toString()}`);
  }

  async getAIAssistant(id: string) {
    return this.makeRequest(`/ai-assistant/assistants/${id}`);
  }

  async createAIAssistant(assistant: Omit<AIAssistant, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.makeRequest('/ai-assistant/assistants', {
      method: 'POST',
      body: JSON.stringify(assistant),
    });
  }

  async updateAIAssistant(id: string, data: Partial<AIAssistant>) {
    return this.makeRequest(`/ai-assistant/assistants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAIAssistant(id: string) {
    return this.makeRequest(`/ai-assistant/assistants/${id}`, {
      method: 'DELETE',
    });
  }

  async trainAIAssistant(id: string, trainingData: any) {
    return this.makeRequest(`/ai-assistant/assistants/${id}/train`, {
      method: 'POST',
      body: JSON.stringify(trainingData),
    });
  }

  async getTrainingStatus(assistantId: string, trainingId: string) {
    return this.makeRequest(`/ai-assistant/assistants/${assistantId}/training/${trainingId}`);
  }

  // AI Chat Conversations
  async createChatSession(assistantId: string, context?: any) {
    return this.makeRequest('/ai-assistant/chat/session', {
      method: 'POST',
      body: JSON.stringify({ assistantId, context }),
    });
  }

  async sendMessage(data: {
    conversationId: string;
    message: string;
    attachments?: File[];
    context?: any;
  }) {
    const formData = new FormData();
    formData.append('conversationId', data.conversationId);
    formData.append('message', data.message);
    formData.append('context', JSON.stringify(data.context || {}));

    if (data.attachments) {
      data.attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file);
      });
    }

    return this.makeRequest('/ai-assistant/chat/message', {
      method: 'POST',
      body: formData,
    });
  }

  async getConversationHistory(conversationId: string, params?: {
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    return this.makeRequest(`/ai-assistant/chat/conversations/${conversationId}/history?${queryParams.toString()}`);
  }

  async getConversations(params?: {
    assistantId?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    status?: 'active' | 'completed' | 'abandoned';
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.assistantId) queryParams.append('assistantId', params.assistantId);
    if (params?.userId) queryParams.append('userId', params.userId);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    return this.makeRequest(`/ai-assistant/chat/conversations?${queryParams.toString()}`);
  }

  async endConversation(conversationId: string, feedback?: {
    rating: number;
    helpful: boolean;
    accurate: boolean;
    complete: boolean;
    comments?: string;
    categories?: Array<{
      category: string;
      score: number;
      comment?: string;
    }>;
  }) {
    return this.makeRequest(`/ai-assistant/chat/conversations/${conversationId}/end`, {
      method: 'POST',
      body: JSON.stringify({ feedback }),
    });
  }

  async provideFeedback(messageId: string, feedback: {
    rating?: number;
    helpful: boolean;
    accurate: boolean;
    complete: boolean;
    comments?: string;
    categories?: Array<{
      category: string;
      score: number;
      comment?: string;
    }>;
  }) {
    return this.makeRequest(`/ai-assistant/chat/messages/${messageId}/feedback`, {
      method: 'POST',
      body: JSON.stringify(feedback),
    });
  }

  // AI Assistant Analytics
  async getAIAnalytics(period?: string) {
    const params = period ? `?period=${period}` : '';
    return this.makeRequest(`/ai-assistant/analytics${params}`);
  }

  async getAIUsageMetrics() {
    return this.makeRequest('/ai-assistant/usage-metrics');
  }

  async getAISatisfactionMetrics() {
    return this.makeRequest('/ai-assistant/satisfaction');
  }

  // AI Knowledge Base
  async getKnowledgeBase(assistantId: string) {
    return this.makeRequest(`/ai-assistant/assistants/${assistantId}/knowledge-base`);
  }

  async updateKnowledgeBase(assistantId: string, updates: {
    addSources?: any[];
    removeSources?: string[];
    updatePriorities?: { [key: string]: number };
  }) {
    return this.makeRequest(`/ai-assistant/assistants/${assistantId}/knowledge-base`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async refreshKnowledgeBase(assistantId: string) {
    return this.makeRequest(`/ai-assistant/assistants/${assistantId}/knowledge-base/refresh`, {
      method: 'POST',
    });
  }

  // Utility methods for mobile app
  async startQuickChat(assistantType: string = 'general') {
    // Get available assistants of the specified type
    const assistants = await this.getAIAssistants({ type: assistantType, isActive: true });
    if (assistants.assistants && assistants.assistants.length > 0) {
      const assistant = assistants.assistants[0];
      return this.createChatSession(assistant.id);
    }
    throw new Error(`No active ${assistantType} assistant found`);
  }

  async getQuickResponse(query: string, context?: any) {
    try {
      const session = await this.startQuickChat('general');
      const response = await this.sendMessage({
        conversationId: session.conversationId,
        message: query,
        context,
      });
      return response;
    } catch (error) {
      console.error('Quick chat error:', error);
      throw error;
    }
  }

  async searchKnowledge(query: string, assistantId?: string) {
    if (assistantId) {
      const knowledgeBase = await this.getKnowledgeBase(assistantId);
      // Implement knowledge base search logic
      return { query, results: [], assistantId };
    }
    // Search across all assistants
    return { query, results: [], global: true };
  }
}

export const aiAssistantService = new AIAssistantService();