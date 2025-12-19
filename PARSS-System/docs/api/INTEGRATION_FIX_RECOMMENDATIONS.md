# Integration Fix Recommendations

## Critical Issues - Immediate Action Required

### 1. Mobile Production Configuration Fix 🚨

**Problem**: Mobile app has hardcoded localhost URLs that won't work in production.

**Solution**: Update mobile service files to use environment-based configuration.

#### Files to Update:
- `/mobile/src/services/authService.ts`
- `/mobile/src/services/alertsService.ts`
- `/mobile/src/services/documentsService.ts`
- `/mobile/src/constants/app.ts`

#### Implementation:
```typescript
// Add to each service file
import { Platform } from 'react-native';
import Config from 'react-native-config';

const getApiBaseUrl = () => {
  if (__DEV__) {
    return 'http://localhost:5000/api';
  }
  return Config.API_BASE_URL || 'https://your-domain.com/api';
};

const API_BASE_URL = getApiBaseUrl();
```

#### Environment Configuration:
```bash
# mobile/.env.production
API_BASE_URL=https://your-production-domain.com/api
```

### 2. Mobile Token Refresh Implementation 🚨

**Problem**: Mobile lacks automatic token refresh, causing authentication failures.

**Solution**: Implement token refresh logic in mobile auth service.

#### Update `/mobile/src/services/authService.ts`:
```typescript
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
        await AsyncStorage.setItem('authToken', data.access_token);
        if (data.refresh_token) {
          await AsyncStorage.setItem('refreshToken', data.refresh_token);
        }
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      await this.signOut(); // Clear tokens on refresh failure
    }
    return false;
  }
}
```

### 3. Complete Phase 3 Mobile Implementation 🚨

**Problem**: Mobile app missing Phase 3 features (Blockchain, IoT, AI Assistant).

**Solution**: Create Phase 3 service files for mobile.

#### Create Files:
- `/mobile/src/services/blockchainService.ts`
- `/mobile/src/services/iotService.ts`
- `/mobile/src/services/aiAssistantService.ts`

#### Example: `/mobile/src/services/blockchainService.ts`
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = getApiBaseUrl(); // Use same logic as authService

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

  async getBlockchainRecords(params?: {
    page?: number;
    limit?: number;
    dataType?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.dataType) queryParams.append('dataType', params.dataType);

    return this.makeRequest(`/blockchain/records?${queryParams.toString()}`);
  }

  async createBlockchainRecord(data: {
    dataType: string;
    data: any;
    metadata: any;
  }) {
    return this.makeRequest('/blockchain/records', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyRecord(transactionHash: string) {
    return this.makeRequest(`/blockchain/verify-record/${transactionHash}`, {
      method: 'POST',
    });
  }
}

export const blockchainService = new BlockchainService();
```

## Moderate Issues - Medium Priority

### 4. Standardize API Error Handling ⚠️

**Problem**: Inconsistent error handling across platforms.

**Solution**: Create shared error handling utilities.

#### Create `/mobile/src/utils/errorHandler.ts`:
```typescript
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

export const showError = (error: any) => {
  const message = handleApiError(error);
  // Show user-friendly error (implement based on your UI library)
  console.error('API Error:', message);
};
```

#### Update mobile services to use error handler:
```typescript
import { handleApiError, showError } from '../utils/errorHandler';

// In service methods
try {
  const response = await this.makeRequest(endpoint, options);
  return response;
} catch (error) {
  const errorMessage = handleApiError(error);
  showError(error);
  throw new Error(errorMessage);
}
```

### 5. Fix API Endpoint Mismatches ⚠️

**Problem**: Some server routes don't match client expectations.

**Solution**: Update server routes to match client API expectations.

#### Update `/server/routes/blockchain.js`:
```javascript
// Add missing endpoints that client expects
router.get('/blockchain/records', authenticateToken, async (req, res) => {
  // Implementation matching client expectations
});

router.get('/blockchain/transactions', authenticateToken, async (req, res) => {
  // Implementation matching client expectations
});

router.get('/blockchain/analytics', authenticateToken, async (req, res) => {
  // Implementation matching client expectations
});
```

### 6. Environment Configuration Standardization ⚠️

**Problem**: Inconsistent environment variable naming and handling.

**Solution**: Standardize environment configuration across all platforms.

#### Client (.env):
```bash
VITE_API_BASE_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000
```

#### Mobile (.env):
```bash
API_BASE_URL=http://localhost:5000/api
WS_URL=ws://localhost:5000
```

#### Server (.env):
```bash
NODE_ENV=development
PORT=5000
JWT_SECRET=your-jwt-secret
DATABASE_URL=postgresql://...
```

## Implementation Steps

### Phase 1: Critical Fixes (Week 1)
1. ✅ Fix mobile production configuration
2. ✅ Implement mobile token refresh
3. ✅ Create Phase 3 mobile services

### Phase 2: Standardization (Week 2)
4. ✅ Implement shared error handling
5. ✅ Fix API endpoint mismatches
6. ✅ Standardize environment configuration

### Phase 3: Testing & Validation (Week 3)
7. ✅ Test all integrations
8. ✅ Validate production deployment
9. ✅ Performance testing

## Testing Checklist

### Mobile App Testing
- [ ] App connects to production API
- [ ] Token refresh works automatically
- [ ] All core features functional
- [ ] Phase 3 features accessible
- [ ] Offline functionality (if implemented)
- [ ] Error messages user-friendly

### Integration Testing
- [ ] Server endpoints match client expectations
- [ ] Authentication flows work across platforms
- [ ] Data consistency between platforms
- [ ] Performance under load
- [ ] Error scenarios handled properly

### Production Deployment
- [ ] Environment variables configured
- [ ] HTTPS endpoints working
- [ ] CORS properly configured
- [ ] Rate limiting active
- [ ] Monitoring and logging configured

## Monitoring & Maintenance

### Key Metrics to Track
- API response times
- Authentication success/failure rates
- Mobile app crash reports
- Server error rates
- User engagement across platforms

### Regular Maintenance Tasks
- Token refresh optimization
- API endpoint updates
- Security patch management
- Performance optimization
- User feedback integration

## Success Criteria

### Immediate Success (Week 1)
- Mobile app works in production environment
- No authentication failures due to expired tokens
- All Phase 3 features available on mobile

### Medium-term Success (Month 1)
- Zero critical integration issues
- Consistent user experience across platforms
- Automated testing in place

### Long-term Success (Quarter 1)
- Feature parity across all platforms
- Robust error handling and recovery
- Scalable architecture for future growth