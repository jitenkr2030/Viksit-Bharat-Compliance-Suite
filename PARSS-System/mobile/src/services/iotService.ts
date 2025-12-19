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

export interface IoTDevice {
  id: string;
  name: string;
  type: string;
  category: string;
  status: 'online' | 'offline' | 'maintenance' | 'error';
  location: string;
  building: string;
  floor?: string;
  room?: string;
  lastHeartbeat: string;
  batteryLevel?: number;
  signalStrength?: number;
  firmwareVersion: string;
  ipAddress?: string;
  macAddress?: string;
  manufacturer: string;
  model: string;
  installationDate: string;
  warrantyExpiry?: string;
  maintenanceSchedule?: {
    nextMaintenance: string;
    frequency: string;
    lastMaintenance: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface IoTSensorData {
  id: string;
  deviceId: string;
  dataType: string;
  value: number;
  unit: string;
  timestamp: string;
  quality: 'good' | 'fair' | 'poor' | 'error';
  location: string;
  metadata?: Record<string, any>;
}

export interface IoTAlert {
  id: string;
  deviceId: string;
  alertType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved';
  message: string;
  timestamp: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  acknowledgedBy?: string;
  resolvedBy?: string;
  metadata?: Record<string, any>;
}

export interface MaintenanceSchedule {
  deviceId: string;
  nextMaintenance: string;
  frequency: string;
  lastMaintenance: string;
  tasks: Array<{
    id: string;
    name: string;
    description: string;
    completed: boolean;
    completedAt?: string;
    notes?: string;
  }>;
}

export interface IoTAnalytics {
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
}

class IoTService {
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
      
      // Handle 401 errors with token refresh
      if (response.status === 401 && !options.headers?.['x-refreshing-token']) {
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
      console.error('IoT API Error:', error);
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

  // IoT Devices
  async getIoTDevices(params?: {
    page?: number;
    limit?: number;
    type?: string;
    category?: string;
    status?: string;
    building?: string;
    location?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.building) queryParams.append('building', params.building);
    if (params?.location) queryParams.append('location', params.location);

    return this.makeRequest(`/iot/devices?${queryParams.toString()}`);
  }

  async getIoTDevice(id: string) {
    return this.makeRequest(`/iot/devices/${id}`);
  }

  async createIoTDevice(device: Omit<IoTDevice, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.makeRequest('/iot/devices', {
      method: 'POST',
      body: JSON.stringify(device),
    });
  }

  async updateIoTDevice(id: string, data: Partial<IoTDevice>) {
    return this.makeRequest(`/iot/devices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteIoTDevice(id: string) {
    return this.makeRequest(`/iot/devices/${id}`, {
      method: 'DELETE',
    });
  }

  async getDeviceStatus(id: string) {
    return this.makeRequest(`/iot/devices/${id}/status`);
  }

  async calibrateDevice(id: string, calibrationData: any) {
    return this.makeRequest(`/iot/devices/${id}/calibrate`, {
      method: 'POST',
      body: JSON.stringify(calibrationData),
    });
  }

  async getDeviceMaintenanceSchedule(id: string) {
    return this.makeRequest(`/iot/devices/${id}/maintenance`);
  }

  async updateMaintenanceSchedule(id: string, schedule: MaintenanceSchedule) {
    return this.makeRequest(`/iot/devices/${id}/maintenance`, {
      method: 'PUT',
      body: JSON.stringify(schedule),
    });
  }

  // IoT Sensor Data
  async getSensorData(params?: {
    deviceId?: string;
    dataType?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.deviceId) queryParams.append('deviceId', params.deviceId);
    if (params?.dataType) queryParams.append('dataType', params.dataType);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    return this.makeRequest(`/iot/sensor-data?${queryParams.toString()}`);
  }

  async getSensorDataByDevice(deviceId: string, timeRange?: string) {
    const params = timeRange ? `?timeRange=${timeRange}` : '';
    return this.makeRequest(`/iot/devices/${deviceId}/data${params}`);
  }

  async getAggregatedSensorData(params: {
    deviceIds?: string[];
    dataType?: string;
    aggregation: 'hourly' | 'daily' | 'weekly' | 'monthly';
    startDate: string;
    endDate: string;
  }) {
    return this.makeRequest('/iot/sensor-data/aggregated', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // IoT Alerts
  async getIoTAlerts(params?: {
    deviceId?: string;
    severity?: string;
    status?: 'active' | 'acknowledged' | 'resolved';
    alertType?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.deviceId) queryParams.append('deviceId', params.deviceId);
    if (params?.severity) queryParams.append('severity', params.severity);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.alertType) queryParams.append('alertType', params.alertType);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    return this.makeRequest(`/iot/alerts?${queryParams.toString()}`);
  }

  async getIoTAlert(id: string) {
    return this.makeRequest(`/iot/alerts/${id}`);
  }

  async acknowledgeAlert(id: string, note?: string) {
    return this.makeRequest(`/iot/alerts/${id}/acknowledge`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
  }

  async resolveAlert(id: string, resolution: string) {
    return this.makeRequest(`/iot/alerts/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolution }),
    });
  }

  async createAlertRule(rule: {
    deviceId: string;
    alertType: string;
    conditions: any;
    actions: any[];
  }) {
    return this.makeRequest('/iot/alert-rules', {
      method: 'POST',
      body: JSON.stringify(rule),
    });
  }

  async getAlertRules(deviceId?: string) {
    const params = deviceId ? `?deviceId=${deviceId}` : '';
    return this.makeRequest(`/iot/alert-rules${params}`);
  }

  // IoT Analytics
  async getIoTAnalytics(period?: string) {
    const params = period ? `?period=${period}` : '';
    return this.makeRequest(`/iot/analytics${params}`);
  }

  async getIoTCoverage() {
    return this.makeRequest('/iot/coverage');
  }

  async getIoTPerformance() {
    return this.makeRequest('/iot/performance');
  }
}

export const iotService = new IoTService();