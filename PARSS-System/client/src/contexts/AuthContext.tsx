import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authAPI } from '@/services/api';
import { User, LoginCredentials, RegisterData } from '@/types/auth';

// Types
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

// Action types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_UPDATE'; payload: User };

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    case 'AUTH_UPDATE':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const queryClient = useQueryClient();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('authToken');
      
      if (token) {
        try {
          dispatch({ type: 'AUTH_START' });
          
          // Validate token and get user data
          const userData = await authAPI.validateToken();
          
          if (userData) {
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: { user: userData.user, token },
            });
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            dispatch({ type: 'AUTH_LOGOUT' });
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      } else {
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    };

    initializeAuth();
  }, []);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authAPI.login(credentials),
    onSuccess: (data) => {
      const { user, tokens } = data;
      
      // Store tokens
      localStorage.setItem('authToken', tokens.access_token);
      localStorage.setItem('refreshToken', tokens.refresh_token);
      
      // Update state
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token: tokens.access_token },
      });
      
      // Invalidate queries
      queryClient.invalidateQueries();
      
      toast.success('Login successful!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      toast.error(message);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => authAPI.register(data),
    onSuccess: (data) => {
      const { user, tokens } = data;
      
      // Store tokens
      localStorage.setItem('authToken', tokens.access_token);
      localStorage.setItem('refreshToken', tokens.refresh_token);
      
      // Update state
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token: tokens.access_token },
      });
      
      toast.success('Registration successful!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      toast.error(message);
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<User>) => authAPI.updateProfile(data),
    onSuccess: (data) => {
      dispatch({ type: 'AUTH_UPDATE', payload: data.user });
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      toast.success('Profile updated successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      authAPI.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      toast.success('Password changed successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Password change failed';
      toast.error(message);
    },
  });

  // Login function
  const login = async (credentials: LoginCredentials) => {
    await loginMutation.mutateAsync(credentials);
  };

  // Register function
  const register = async (data: RegisterData) => {
    await registerMutation.mutateAsync(data);
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout API if authenticated
      if (state.isAuthenticated) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear tokens and state regardless of API call result
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      
      // Clear all queries
      queryClient.clear();
      
      // Update state
      dispatch({ type: 'AUTH_LOGOUT' });
      
      toast.success('Logged out successfully');
    }
  };

  // Check if user has permission
  const hasPermission = (permission: string): boolean => {
    if (!state.user) return false;
    
    // Super admin and system admin have all permissions
    if (['system_admin', 'super_admin'].includes(state.user.role)) {
      return true;
    }
    
    // Check explicit permissions
    if (state.user.permissions && state.user.permissions[permission]) {
      return true;
    }
    
    // Role-based default permissions
    const rolePermissions: Record<string, string[]> = {
      admin: ['*'],
      compliance_officer: [
        'view_dashboard',
        'manage_approvals',
        'manage_alerts',
        'generate_reports',
        'manage_documents',
        'view_faculty'
      ],
      principal: [
        'view_dashboard',
        'view_reports',
        'manage_faculty',
        'view_approvals',
        'view_alerts'
      ],
      auditor: [
        'view_dashboard',
        'generate_reports',
        'view_all_data',
        'audit_compliance'
      ],
      faculty: [
        'view_own_data',
        'update_profile',
        'upload_documents'
      ],
      viewer: [
        'view_dashboard',
        'view_basic_reports'
      ]
    };
    
    return rolePermissions[state.user.role]?.includes(permission) || 
           rolePermissions[state.user.role]?.includes('*') || 
           false;
  };

  // Check if user has role
  const hasRole = (role: string): boolean => {
    return state.user?.role === role;
  };

  // Update profile function
  const updateProfile = async (data: Partial<User>) => {
    await updateProfileMutation.mutateAsync(data);
  };

  // Change password function
  const changePassword = async (currentPassword: string, newPassword: string) => {
    await changePasswordMutation.mutateAsync({ currentPassword, newPassword });
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    hasPermission,
    hasRole,
    updateProfile,
    changePassword,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;