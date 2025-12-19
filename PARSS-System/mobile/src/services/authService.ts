import AsyncStorage from '@react-native-async-storage/async-storage';
import { authTypes } from '../types/auth';
import Config from 'react-native-config';

// Environment-based API configuration
const getApiBaseUrl = () => {
  if (__DEV__) {
    return 'http://localhost:5000/api';
  }
  return Config.API_BASE_URL || 'https://your-production-domain.com/api';
};

const API_BASE_URL = getApiBaseUrl();

class AuthService {
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
          // Retry original request with new token
          const newToken = await AsyncStorage.getItem('authToken');
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${newToken}`,
            'x-refreshing-token': 'true'
          };
          return this.makeRequest(endpoint, options);
        } else {
          // Refresh failed, sign out user
          await this.signOut();
          throw new Error('Session expired. Please log in again.');
        }
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('Auth API Error:', error);
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
          // Handle new token format
          await AsyncStorage.setItem('authToken', data.tokens.access_token);
          if (data.tokens.refresh_token) {
            await AsyncStorage.setItem('refreshToken', data.tokens.refresh_token);
          }
        } else {
          // Handle old token format
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

  async signIn(email: string, password: string) {
    try {
      const response = await this.makeRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      // Handle different response formats
      if (response.tokens) {
        // New format with tokens object
        await AsyncStorage.setItem('authToken', response.tokens.access_token);
        if (response.tokens.refresh_token) {
          await AsyncStorage.setItem('refreshToken', response.tokens.refresh_token);
        }
      } else if (response.token) {
        // Old format with single token
        await AsyncStorage.setItem('authToken', response.token);
        if (response.refresh_token) {
          await AsyncStorage.setItem('refreshToken', response.refresh_token);
        }
      }

      if (response.user) {
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  async signUp(userData: authTypes.SignUpData) {
    try {
      const response = await this.makeRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  async signOut() {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('user');
      return true;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  async forgotPassword(email: string) {
    try {
      const response = await this.makeRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(token: string, password: string) {
    try {
      const response = await this.makeRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const response = await this.makeRequest('/auth/me');
      return response.user;
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(profileData: Partial<authTypes.User>) {
    try {
      const response = await this.makeRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });

      if (response.user) {
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  async changePassword(currentPassword: string, newPassword: string) {
    try {
      const response = await this.makeRequest('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return false;

      await this.getCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  }

  async getStoredUser(): Promise<authTypes.User | null> {
    try {
      const userStr = await AsyncStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      return null;
    }
  }

  async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      return null;
    }
  }
}

export const authService = new AuthService();