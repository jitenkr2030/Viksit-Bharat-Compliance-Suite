import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LoginCredentials, RegisterData, AuthState, AuthContextType, AuthEvent } from '../types/auth';
import { AuthService } from '../services/AuthService';
import { StorageService } from '../services/StorageService';
import { BiometricService } from '../services/BiometricService';
import APP_CONFIG from '../constants/app';

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
  error: null,
};

// Action types
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; tokens: any } }
  | { type: 'LOGIN_FAILURE'; payload: { error: string } }
  | { type: 'LOGOUT' }
  | { type: 'TOKEN_REFRESHED'; payload: { tokens: any } }
  | { type: 'TOKEN_EXPIRED' }
  | { type: 'PROFILE_UPDATED'; payload: { user: User } }
  | { type: 'PASSWORD_CHANGED' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'AUTH_ERROR'; payload: { error: string } }
  | { type: 'INITIALIZE_SUCCESS'; payload: { user: User | null; isAuthenticated: boolean } };

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'LOGIN_FAILURE':
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error,
      };

    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case 'TOKEN_REFRESHED':
      // Token refreshed, user state remains the same
      return {
        ...state,
        isLoading: false,
        error: null,
      };

    case 'TOKEN_EXPIRED':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Session expired',
      };

    case 'PROFILE_UPDATED':
      return {
        ...state,
        user: action.payload.user,
      };

    case 'PASSWORD_CHANGED':
      return {
        ...state,
        error: null,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'INITIALIZE_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: action.payload.isAuthenticated,
        isLoading: false,
        isInitialized: true,
        error: null,
      };

    default:
      return state;
  }
};

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize authentication state
  useEffect(() => {
    initializeAuth();
  }, []);

  // Auto token refresh
  useEffect(() => {
    let refreshInterval: NodeJS.Timeout;

    if (state.isAuthenticated && state.user) {
      // Refresh token every 25 minutes (token expires in 30 minutes)
      refreshInterval = setInterval(async () => {
        try {
          const tokens = await AuthService.refreshToken();
          dispatch({ type: 'TOKEN_REFRESHED', payload: { tokens } });
        } catch (error) {
          console.error('Token refresh failed:', error);
          dispatch({ type: 'TOKEN_EXPIRED' });
        }
      }, 25 * 60 * 1000);
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [state.isAuthenticated, state.user]);

  // Initialize authentication from storage
  const initializeAuth = async () => {
    try {
      dispatch({ type: 'LOGIN_START' });

      const token = await StorageService.getAuthToken();
      const refreshToken = await StorageService.getRefreshToken();
      const userData = await StorageService.getUserData();

      if (token && userData) {
        // Validate existing token
        try {
          const validatedUser = await AuthService.validateToken();
          if (validatedUser) {
            dispatch({
              type: 'INITIALIZE_SUCCESS',
              payload: { user: validatedUser, isAuthenticated: true }
            });
            return;
          }
        } catch (error) {
          // Token invalid, try refresh
          if (refreshToken) {
            try {
              const tokens = await AuthService.refreshToken();
              const refreshedUser = await AuthService.validateToken();
              if (refreshedUser) {
                dispatch({
                  type: 'INITIALIZE_SUCCESS',
                  payload: { user: refreshedUser, isAuthenticated: true }
                });
                return;
              }
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
            }
          }
        }
      }

      // No valid authentication found
      dispatch({
        type: 'INITIALIZE_SUCCESS',
        payload: { user: null, isAuthenticated: false }
      });

    } catch (error) {
      console.error('Auth initialization error:', error);
      dispatch({
        type: 'INITIALIZE_SUCCESS',
        payload: { user: null, isAuthenticated: false }
      });
    }
  };

  // Login function
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      dispatch({ type: 'LOGIN_START' });

      const response = await AuthService.login(credentials);
      
      // Store authentication data
      await StorageService.setAuthTokens(response.tokens);
      await StorageService.setUserData(response.user);

      // Enable biometric authentication if requested
      if (credentials.biometricEnabled) {
        await BiometricService.enableBiometric();
      }

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: response.user, tokens: response.tokens }
      });

    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: { error: errorMessage } });
      throw error;
    }
  };

  // Register function
  const register = async (data: RegisterData): Promise<void> => {
    try {
      dispatch({ type: 'LOGIN_START' });

      const response = await AuthService.register(data);
      
      // Store authentication data
      await StorageService.setAuthTokens(response.tokens);
      await StorageService.setUserData(response.user);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: response.user, tokens: response.tokens }
      });

    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: { error: errorMessage } });
      throw error;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      // Clear storage
      await StorageService.clearAuthData();
      
      // Logout from server
      await AuthService.logout();
      
      // Disable biometric authentication
      await BiometricService.disableBiometric();

      dispatch({ type: 'LOGOUT' });

    } catch (error) {
      console.error('Logout error:', error);
      // Even if server logout fails, clear local data
      await StorageService.clearAuthData();
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Refresh token function
  const refreshToken = async (): Promise<void> => {
    try {
      const tokens = await AuthService.refreshToken();
      await StorageService.setAuthTokens(tokens);
      dispatch({ type: 'TOKEN_REFRESHED', payload: { tokens } });
    } catch (error: any) {
      const errorMessage = error.message || 'Token refresh failed';
      dispatch({ type: 'AUTH_ERROR', payload: { error: errorMessage } });
      throw error;
    }
  };

  // Update profile function
  const updateProfile = async (data: Partial<User>): Promise<void> => {
    try {
      const updatedUser = await AuthService.updateProfile(data);
      await StorageService.setUserData(updatedUser);
      dispatch({ type: 'PROFILE_UPDATED', payload: { user: updatedUser } });
    } catch (error: any) {
      const errorMessage = error.message || 'Profile update failed';
      dispatch({ type: 'AUTH_ERROR', payload: { error: errorMessage } });
      throw error;
    }
  };

  // Change password function
  const changePassword = async (data: { currentPassword: string; newPassword: string; confirmPassword: string }): Promise<void> => {
    try {
      await AuthService.changePassword(data);
      dispatch({ type: 'PASSWORD_CHANGED' });
    } catch (error: any) {
      const errorMessage = error.message || 'Password change failed';
      dispatch({ type: 'AUTH_ERROR', payload: { error: errorMessage } });
      throw error;
    }
  };

  // Forgot password function
  const forgotPassword = async (data: { email: string }): Promise<void> => {
    try {
      await AuthService.forgotPassword(data);
    } catch (error: any) {
      const errorMessage = error.message || 'Password reset request failed';
      dispatch({ type: 'AUTH_ERROR', payload: { error: errorMessage } });
      throw error;
    }
  };

  // Reset password function
  const resetPassword = async (data: { token: string; password: string; confirmPassword: string }): Promise<void> => {
    try {
      await AuthService.resetPassword(data);
    } catch (error: any) {
      const errorMessage = error.message || 'Password reset failed';
      dispatch({ type: 'AUTH_ERROR', payload: { error: errorMessage } });
      throw error;
    }
  };

  // Clear error function
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Check permission function
  const hasPermission = (permission: string): boolean => {
    if (!state.user) return false;
    return state.user.permissions.includes('all') || state.user.permissions.includes(permission);
  };

  // Check role function
  const hasRole = (role: string): boolean => {
    if (!state.user) return false;
    return state.user.role === role;
  };

  // Context value
  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    clearError,
    hasPermission,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export context for advanced usage
export { AuthContext };

// Export action types for external usage
export type { AuthAction };