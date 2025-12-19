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

export interface Document {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'doc' | 'image' | 'other';
  category: 'regulatory' | 'standards' | 'accreditation' | 'internal';
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  uploadDate: string;
  size: string;
  author: string;
  fileUrl?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface DocumentFilter {
  category?: string;
  status?: string;
  type?: string;
  search?: string;
}

class DocumentsService {
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
      console.error('Documents API Error:', error);
      throw error;
    }
  }

  async getDocuments(filter: DocumentFilter = {}) {
    try {
      const params = new URLSearchParams();
      if (filter.category) params.append('category', filter.category);
      if (filter.status) params.append('status', filter.status);
      if (filter.type) params.append('type', filter.type);
      if (filter.search) params.append('search', filter.search);

      const response = await this.makeRequest(`/documents?${params.toString()}`);
      return response.documents || [];
    } catch (error) {
      throw error;
    }
  }

  async getDocument(documentId: string) {
    try {
      const response = await this.makeRequest(`/documents/${documentId}`);
      return response.document;
    } catch (error) {
      throw error;
    }
  }

  async uploadDocument(documentData: FormData) {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/documents`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: documentData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      return data;
    } catch (error) {
      console.error('Document upload error:', error);
      throw error;
    }
  }

  async updateDocument(documentId: string, updateData: Partial<Document>) {
    try {
      const response = await this.makeRequest(`/documents/${documentId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      return response.document;
    } catch (error) {
      throw error;
    }
  }

  async deleteDocument(documentId: string) {
    try {
      const response = await this.makeRequest(`/documents/${documentId}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async submitDocument(documentId: string) {
    try {
      const response = await this.makeRequest(`/documents/${documentId}/submit`, {
        method: 'POST',
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async downloadDocument(documentId: string): Promise<string> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/documents/${documentId}/download`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      // Return blob URL or base64 data depending on implementation
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      throw error;
    }
  }

  async getDocumentCategories() {
    try {
      const response = await this.makeRequest('/documents/categories');
      return response.categories || [];
    } catch (error) {
      throw error;
    }
  }

  async getDocumentStats() {
    try {
      const response = await this.makeRequest('/documents/stats');
      return response.stats || {};
    } catch (error) {
      throw error;
    }
  }

  async searchDocuments(query: string) {
    try {
      const response = await this.makeRequest(`/documents/search?q=${encodeURIComponent(query)}`);
      return response.documents || [];
    } catch (error) {
      throw error;
    }
  }

  async getRecentDocuments(limit: number = 5) {
    try {
      const response = await this.makeRequest(`/documents/recent?limit=${limit}`);
      return response.documents || [];
    } catch (error) {
      throw error;
    }
  }
}

export const documentsService = new DocumentsService();