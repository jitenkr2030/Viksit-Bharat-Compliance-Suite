import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { authService } from '../services/authService';
import { authTypes } from '../types/auth';

export function useAuth() {
  const [user, setUser] = useState<authTypes.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authenticated = await authService.isAuthenticated();
      const storedUser = await authService.getStoredUser();
      
      setIsAuthenticated(authenticated);
      setUser(storedUser);
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authService.signIn(email, password);
      setUser(response.user);
      setIsAuthenticated(true);
      return response;
    } catch (error: any) {
      throw error;
    }
  };

  const signUp = async (userData: authTypes.SignUpData) => {
    try {
      const response = await authService.signUp(userData);
      return response;
    } catch (error: any) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error: any) {
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const response = await authService.forgotPassword(email);
      return response;
    } catch (error: any) {
      throw error;
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      const response = await authService.resetPassword(token, password);
      return response;
    } catch (error: any) {
      throw error;
    }
  };

  const updateProfile = async (profileData: Partial<authTypes.User>) => {
    try {
      const response = await authService.updateProfile(profileData);
      setUser(response.user);
      return response;
    } catch (error: any) {
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const response = await authService.changePassword(currentPassword, newPassword);
      return response;
    } catch (error: any) {
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const updatedUser = await authService.getCurrentUser();
      setUser(updatedUser);
      return updatedUser;
    } catch (error: any) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
    refreshUser,
    checkAuthStatus,
  };
}