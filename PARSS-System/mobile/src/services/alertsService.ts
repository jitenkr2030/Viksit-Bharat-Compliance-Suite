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

export interface Alert {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  read: boolean;
  category: 'regulatory' | 'standards' | 'accreditation' | 'general';
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}

export interface AlertFilter {
  category?: string;
  type?: string;
  read?: boolean;
  priority?: string;
  limit?: number;
  offset?: number;
}

class AlertsService {
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
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('Alerts API Error:', error);
      throw error;
    }
  }

  async getAlerts(filter: AlertFilter = {}) {
    try {
      const params = new URLSearchParams();
      if (filter.category) params.append('category', filter.category);
      if (filter.type) params.append('type', filter.type);
      if (filter.read !== undefined) params.append('read', filter.read.toString());
      if (filter.priority) params.append('priority', filter.priority);
      if (filter.limit) params.append('limit', filter.limit.toString());
      if (filter.offset) params.append('offset', filter.offset.toString());

      const response = await this.makeRequest(`/alerts?${params.toString()}`);
      return response.alerts || [];
    } catch (error) {
      throw error;
    }
  }

  async getAlert(alertId: string) {
    try {
      const response = await this.makeRequest(`/alerts/${alertId}`);
      return response.alert;
    } catch (error) {
      throw error;
    }
  }

  async markAsRead(alertId: string) {
    try {
      const response = await this.makeRequest(`/alerts/${alertId}/read`, {
        method: 'POST',
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async markAsUnread(alertId: string) {
    try {
      const response = await this.makeRequest(`/alerts/${alertId}/unread`, {
        method: 'POST',
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async markAllAsRead() {
    try {
      const response = await this.makeRequest('/alerts/mark-all-read', {
        method: 'POST',
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async deleteAlert(alertId: string) {
    try {
      const response = await this.makeRequest(`/alerts/${alertId}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getUnreadCount() {
    try {
      const response = await this.makeRequest('/alerts/unread-count');
      return response.count || 0;
    } catch (error) {
      throw error;
    }
  }

  async getAlertStats() {
    try {
      const response = await this.makeRequest('/alerts/stats');
      return response.stats || {};
    } catch (error) {
      throw error;
    }
  }

  async createAlert(alertData: Omit<Alert, 'id' | 'timestamp' | 'read'>) {
    try {
      const response = await this.makeRequest('/alerts', {
        method: 'POST',
        body: JSON.stringify(alertData),
      });
      return response.alert;
    } catch (error) {
      throw error;
    }
  }

  async getCategories() {
    try {
      const response = await this.makeRequest('/alerts/categories');
      return response.categories || [];
    } catch (error) {
      throw error;
    }
  }

  async subscribeToAlerts() {
    // This would typically use push notifications
    try {
      const response = await this.makeRequest('/alerts/subscribe', {
        method: 'POST',
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async unsubscribeFromAlerts() {
    try {
      const response = await this.makeRequest('/alerts/unsubscribe', {
        method: 'POST',
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Local notification management
  async getLocalAlerts(): Promise<Alert[]> {
    try {
      const alertsStr = await AsyncStorage.getItem('localAlerts');
      return alertsStr ? JSON.parse(alertsStr) : [];
    } catch (error) {
      return [];
    }
  }

  async saveLocalAlert(alert: Alert) {
    try {
      const localAlerts = await this.getLocalAlerts();
      const updatedAlerts = [...localAlerts, alert];
      await AsyncStorage.setItem('localAlerts', JSON.stringify(updatedAlerts));
    } catch (error) {
      throw error;
    }
  }

  async clearLocalAlerts() {
    try {
      await AsyncStorage.removeItem('localAlerts');
    } catch (error) {
      throw error;
    }
  }
}

export const alertsService = new AlertsService();