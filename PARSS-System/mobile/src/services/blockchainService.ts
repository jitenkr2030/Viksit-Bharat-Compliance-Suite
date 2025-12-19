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

export interface BlockchainRecord {
  id: string;
  dataType: string;
  data: any;
  metadata: any;
  transactionHash: string;
  blockNumber: number;
  networkType: 'testnet' | 'mainnet';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BlockchainTransaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  blockNumber: number;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: string;
  confirmations: number;
}

export interface BlockchainAnalytics {
  totalRecords: number;
  recordsByType: { [key: string]: number };
  transactionVolume: { date: string; count: number }[];
  networkStats: {
    testnet: { records: number; transactions: number };
    mainnet: { records: number; transactions: number };
  };
}

class BlockchainService {
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
      console.error('Blockchain API Error:', error);
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

  // Blockchain Records
  async getBlockchainRecords(params?: {
    page?: number;
    limit?: number;
    dataType?: string;
    networkType?: string;
    isVerified?: boolean;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.dataType) queryParams.append('dataType', params.dataType);
    if (params?.networkType) queryParams.append('networkType', params.networkType);
    if (params?.isVerified !== undefined) queryParams.append('isVerified', params.isVerified.toString());
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    return this.makeRequest(`/blockchain/records?${queryParams.toString()}`);
  }

  async getBlockchainRecord(id: string) {
    return this.makeRequest(`/blockchain/records/${id}`);
  }

  async createBlockchainRecord(data: {
    dataType: string;
    data: any;
    metadata: any;
    networkType: 'testnet' | 'mainnet';
  }) {
    return this.makeRequest('/blockchain/records', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBlockchainRecord(id: string, data: Partial<BlockchainRecord>) {
    return this.makeRequest(`/blockchain/records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBlockchainRecord(id: string) {
    return this.makeRequest(`/blockchain/records/${id}`, {
      method: 'DELETE',
    });
  }

  async verifyBlockchainRecord(id: string) {
    return this.makeRequest(`/blockchain/records/${id}/verify`, {
      method: 'POST',
    });
  }

  // Blockchain Transactions
  async getBlockchainTransactions(params?: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    return this.makeRequest(`/blockchain/transactions?${queryParams.toString()}`);
  }

  async getBlockchainTransaction(id: string) {
    return this.makeRequest(`/blockchain/transactions/${id}`);
  }

  async getTransactionByHash(hash: string) {
    return this.makeRequest(`/blockchain/transactions/hash/${hash}`);
  }

  // Blockchain Analytics
  async getBlockchainAnalytics(period?: string) {
    const params = period ? `?period=${period}` : '';
    return this.makeRequest(`/blockchain/analytics${params}`);
  }

  async getBlockchainPerformance() {
    return this.makeRequest('/blockchain/performance');
  }

  // Blockchain Networks
  async getBlockchainNetworks() {
    return this.makeRequest('/blockchain/networks');
  }

  async updateNetworkConfiguration(networkId: string, config: any) {
    return this.makeRequest(`/blockchain/networks/${networkId}`, {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  // Institution-specific methods
  async getInstitutionRecords(institutionId: string) {
    return this.makeRequest(`/blockchain/records/${institutionId}`);
  }

  async getInstitutionAnalytics(institutionId: string, period?: string) {
    const params = period ? `?period=${period}` : '';
    return this.makeRequest(`/blockchain/analytics/${institutionId}${params}`);
  }

  async syncInstitutionRecords(institutionId: string) {
    return this.makeRequest(`/blockchain/sync/${institutionId}`, {
      method: 'POST',
    });
  }

  async exportInstitutionRecords(institutionId: string, format: 'json' | 'csv' = 'json') {
    return this.makeRequest(`/blockchain/export/${institutionId}?format=${format}`);
  }

  // Search and verification
  async searchRecords(query: string, filters?: {
    dataType?: string;
    networkType?: string;
    dateRange?: { start: string; end: string };
  }) {
    const searchData = { query, ...filters };
    return this.makeRequest('/blockchain/search', {
      method: 'POST',
      body: JSON.stringify(searchData),
    });
  }

  async getVerificationStats() {
    return this.makeRequest('/blockchain/verification-stats');
  }

  async getFrameworkStats() {
    return this.makeRequest('/blockchain/framework-stats');
  }

  // System health
  async getSystemHealth() {
    return this.makeRequest('/blockchain/health');
  }
}

export const blockchainService = new BlockchainService();